import { prisma } from '@/lib/prisma'
import { OrderStatus, OrderType, PaymentMethod } from '@prisma/client'

export interface OrderFilters {
  status?: OrderStatus[]
  orderType?: OrderType
  paymentMethod?: PaymentMethod
  search?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface Pagination {
  page: number
  limit: number
}

export async function getOrders(
  cafeId: string, 
  filters: OrderFilters, 
  pagination: Pagination
) {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  // Build where clause
  const where: any = { cafeId }

  if (filters.status && filters.status.length > 0) {
    where.status = { in: filters.status }
  }

  if (filters.orderType) {
    where.orderType = filters.orderType
  }

  if (filters.paymentMethod) {
    where.paymentMethod = filters.paymentMethod
  }

  if (filters.search && filters.search.trim()) {
    where.OR = [
      { customerName: { contains: filters.search, mode: 'insensitive' } },
      { customerPhone: { contains: filters.search, mode: 'insensitive' } },
      { orderNumber: { contains: filters.search, mode: 'insensitive' } }
    ]
  }

  if (filters.dateFrom) {
    where.createdAt = { ...where.createdAt, gte: filters.dateFrom }
  }

  if (filters.dateTo) {
    where.createdAt = { ...where.createdAt, lte: filters.dateTo }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        orderItems: {
          select: {
            id: true
          }
        },
        customer: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.order.count({ where })
  ])

  return {
    orders: orders.map(order => ({
      ...order,
      itemCount: order.orderItems.length
    })),
    total
  }
}

export async function getOrderById(orderId: string, cafeId: string) {
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
      }
    }
  })

  return order
}

export async function updateOrderStatus(
  orderId: string, 
  cafeId: string, 
  newStatus: OrderStatus
) {
  // Verify order belongs to cafe
  const existingOrder = await prisma.order.findFirst({
    where: { 
      id: orderId,
      cafeId 
    }
  })

  if (!existingOrder) {
    throw new Error('Order not found')
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { 
      status: newStatus,
      updatedAt: new Date()
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
      }
    }
  })

  return updatedOrder
}

export async function getOrderStats(
  cafeId: string, 
  dateRange?: { from: Date; to: Date }
) {
  const where: any = { cafeId }

  if (dateRange) {
    where.createdAt = {
      gte: dateRange.from,
      lte: dateRange.to
    }
  }

  const [totalOrders, ordersByStatus, revenueData] = await Promise.all([
    prisma.order.count({ where }),
    
    prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { id: true }
    }),
    
    prisma.order.aggregate({
      where: {
        ...where,
        status: { not: OrderStatus.CANCELLED }
      },
      _sum: { total: true },
      _avg: { total: true }
    })
  ])

  return {
    totalOrders,
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<OrderStatus, number>),
    revenue: revenueData._sum.total || 0,
    averageOrderValue: revenueData._avg.total || 0
  }
}