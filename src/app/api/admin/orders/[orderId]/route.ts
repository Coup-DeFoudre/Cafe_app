import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import { mapOrderToResponse } from '@/lib/mappers/order'
import { OrderStatus } from '@prisma/client'
import { z } from 'zod'
import { triggerOrderStatusUpdated } from '@/lib/pusher-server'

const UpdateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus)
})

interface RouteParams {
  params: {
    orderId: string
  }
}

// Status transition rules
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [], // Terminal state
  CANCELLED: []  // Terminal state
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const cafeId = session.user.cafeId
    const { orderId } = params

    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        cafeId 
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                image: true,
                price: true
              }
            }
          }
        },
        customer: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        cafe: { 
          select: { 
            name: true, 
            logo: true, 
            phone: true 
          } 
        }
      }
    })

    if (!order) {
      return errorResponse('Order not found', 404)
    }

    // Use mapper for consistent response format
    const mappedOrder = mapOrderToResponse(order)

    return successResponse(mappedOrder, 'Order details fetched successfully')

  } catch (error) {
    console.error('Error fetching order details:', error)
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const cafeId = session.user.cafeId
    const { orderId } = params

    const body = await request.json()
    const validatedData = UpdateStatusSchema.parse(body)

    // Fetch existing order
    const existingOrder = await prisma.order.findFirst({
      where: { 
        id: orderId,
        cafeId 
      }
    })

    if (!existingOrder) {
      return errorResponse('Order not found', 404)
    }

    // Validate status transition
    const allowedNext = allowedTransitions[existingOrder.status]
    if (!allowedNext.includes(validatedData.status)) {
      return errorResponse(
        `Cannot transition from ${existingOrder.status} to ${validatedData.status}`, 
        400
      )
    }

    // Update order status
    const updateData: any = {
      status: validatedData.status,
      updatedAt: new Date()
    }

    // If completing an online order, mark payment as paid
    if (validatedData.status === OrderStatus.COMPLETED && 
        existingOrder.paymentMethod === 'ONLINE' && 
        existingOrder.paymentStatus === 'PENDING') {
      updateData.paymentStatus = 'PAID'
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                image: true,
                price: true
              }
            }
          }
        },
        customer: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      }
    })

    // Trigger real-time status update notification
    try {
      await triggerOrderStatusUpdated(cafeId, {
        orderId: updatedOrder.id,
        status: updatedOrder.status,
        orderNumber: updatedOrder.orderNumber,
      })
    } catch (pusherError) {
      // Log error but don't fail the status update
      console.error('Failed to send real-time status update:', pusherError)
    }

    // Use mapper for consistent response format
    const mappedOrder = mapOrderToResponse(updatedOrder)

    return successResponse(mappedOrder, 'Order status updated successfully')

  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid status value', 400)
    }
    console.error('Error updating order status:', error)
    return handleApiError(error)
  }
}