import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  todayRevenue: number
  totalCustomers: number
  statusCounts: { [status in OrderStatus]: number }
  popularItems: Array<{ name: string; count: number }>
}

export async function getDashboardStats(cafeId: string): Promise<DashboardStats> {
  // Total orders count
  const totalOrders = await prisma.order.count({
    where: { cafeId }
  })

  // Pending orders count
  const pendingOrders = await prisma.order.count({
    where: { 
      cafeId,
      status: OrderStatus.PENDING
    }
  })

  // Today's revenue
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  
  const todayRevenueResult = await prisma.order.aggregate({
    where: {
      cafeId,
      createdAt: { gte: startOfToday },
      status: { not: OrderStatus.CANCELLED }
    },
    _sum: { total: true }
  })
  const todayRevenue = todayRevenueResult._sum.total || 0

  // Total customers count
  const totalCustomers = await prisma.customer.count({
    where: { cafeId }
  })

  // Order counts by status
  const statusCountsRaw = await prisma.order.groupBy({
    by: ['status'],
    where: { cafeId },
    _count: { _all: true }
  })
  
  const statusCounts: { [status in OrderStatus]: number } = {
    PENDING: 0,
    CONFIRMED: 0,
    PREPARING: 0,
    READY: 0,
    COMPLETED: 0,
    CANCELLED: 0
  }
  
  statusCountsRaw.forEach(item => {
    statusCounts[item.status] = item._count._all
  })

  // Popular items - DB-level aggregation for scalability
  const popularItemsRaw = await prisma.orderItem.groupBy({
    by: ['menuItemId'],
    where: {
      order: { cafeId }
    },
    _count: { menuItemId: true },
    orderBy: { _count: { menuItemId: 'desc' } },
    take: 5
  })

  // Batch fetch menu item names
  const menuItemIds = popularItemsRaw.map(item => item.menuItemId)
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
    select: { id: true, name: true }
  })

  // Create a map for quick lookups
  const menuItemMap = new Map(menuItems.map(item => [item.id, item.name]))

  // Map the results
  const popularItems = popularItemsRaw.map(item => ({
    name: menuItemMap.get(item.menuItemId) || 'Unknown Item',
    count: item._count.menuItemId
  }))

  return {
    totalOrders,
    pendingOrders,
    todayRevenue,
    totalCustomers,
    statusCounts,
    popularItems
  }
}

export async function getRecentOrders(cafeId: string, limit: number = 10) {
  return await prisma.order.findMany({
    where: { cafeId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { customer: true }
  })
}

export async function getRevenueByDate(cafeId: string, days: number = 7) {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days)

  const orders = await prisma.order.findMany({
    where: {
      cafeId,
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: { not: OrderStatus.CANCELLED }
    },
    select: {
      createdAt: true,
      total: true
    }
  })

  // Group by date
  const revenueByDate = orders.reduce((acc: Record<string, number>, order) => {
    const date = order.createdAt.toISOString().split('T')[0]
    acc[date] = (acc[date] || 0) + order.total
    return acc
  }, {})

  return Object.entries(revenueByDate).map(([date, revenue]) => ({
    date,
    revenue
  }))
}