import { NextRequest } from 'next/server'
// Force this API route to be fully dynamic to avoid static optimization
// attempts that trigger dynamic server usage errors when accessing headers/session.
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { getOrders, OrderFilters } from '@/lib/queries/orders'
import { mapOrdersToResponse } from '@/lib/mappers/order'
import { OrdersApiResponse } from '@/types'
import { OrderStatus, OrderType, PaymentMethod } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const cafeId = session.user.cafeId
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const statusParam = searchParams.get('status')
    const orderType = searchParams.get('orderType') as OrderType | null
    const paymentMethod = searchParams.get('paymentMethod') as PaymentMethod | null
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return errorResponse('Invalid pagination parameters', 400)
    }

    // Build filters object
    const filters: OrderFilters = {}

    // Parse status array
    if (statusParam) {
      const statusArray = statusParam.split(',').filter(s => 
        Object.values(OrderStatus).includes(s as OrderStatus)
      ) as OrderStatus[]
      if (statusArray.length > 0) {
        filters.status = statusArray
      }
    }

    // Add other filters
    if (orderType && Object.values(OrderType).includes(orderType)) {
      filters.orderType = orderType
    }
    if (paymentMethod && Object.values(PaymentMethod).includes(paymentMethod)) {
      filters.paymentMethod = paymentMethod
    }
    if (search.trim()) filters.search = search.trim()
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      if (!isNaN(fromDate.getTime())) {
        filters.dateFrom = fromDate
      }
    }
    if (dateTo) {
      const to = new Date(dateTo)
      if (!isNaN(to.getTime())) {
        // Move to end-of-day
        to.setHours(23, 59, 59, 999)
        filters.dateTo = to
      }
    }

    // Get orders using utility function
    const { orders, total } = await getOrders(
      cafeId,
      filters,
      { page, limit }
    )

    // Format orders for API response using mapper
    const formattedOrders = mapOrdersToResponse(orders)

    const totalPages = Math.ceil(total / limit)

    return successResponse({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }, 'Orders fetched successfully')

  } catch (error) {
    console.error('Error fetching orders:', error)
    return handleApiError(error)
  }
}