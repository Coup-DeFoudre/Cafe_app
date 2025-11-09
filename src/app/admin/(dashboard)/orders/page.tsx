import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import { getOrders } from '@/lib/queries/orders'
import { OrdersPageClient } from '@/components/admin/orders/OrdersPageClient'
import { OrderStatus } from '@prisma/client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders | Cafe Admin',
  description: 'Manage and track cafe orders'
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/admin/login')
  }

  const cafeId = session.user.cafeId

  // Fetch initial orders with default filters (show active statuses)
  const { orders, total } = await getOrders(
    cafeId,
    { status: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING] },
    { page: 1, limit: 20 }
  )

  const formattedOrders = orders.map(order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    orderType: order.orderType,
    tableNumber: order.tableNumber,
    deliveryAddress: order.deliveryAddress,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    itemCount: order.itemCount
  }))

  const initialPagination = {
    page: 1,
    limit: 20,
    total,
    totalPages: Math.ceil(total / 20)
  }

  return (
    <OrdersPageClient 
      initialOrders={formattedOrders}
      initialPagination={initialPagination}
      cafeId={cafeId}
    />
  )
}