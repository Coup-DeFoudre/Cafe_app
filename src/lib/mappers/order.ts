import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '@prisma/client'

// Define the order entity type from Prisma
export interface OrderEntity {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  orderType: OrderType
  tableNumber: string | null
  deliveryAddress: string | null
  deliveryLatitude: number | null
  deliveryLongitude: number | null
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentReferenceId: string | null
  specialInstructions: string | null
  subtotal: number
  tax: number
  deliveryCharge: number
  discount: number
  couponCode: string | null
  total: number
  createdAt: Date
  updatedAt: Date
  itemCount?: number
  orderItems?: any[]
  customer?: {
    name: string
    phone: string
  } | null
  cafe?: {
    name: string
    logo: string | null
    phone: string | null
  }
}

// Response format for order APIs
export interface OrderResponse {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  orderType: OrderType
  tableNumber: string | null
  deliveryAddress: string | null
  deliveryLatitude: number | null
  deliveryLongitude: number | null
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentReferenceId: string | null
  specialInstructions: string | null
  subtotal: number
  tax: number
  deliveryCharge: number
  discount: number
  couponCode: string | null
  total: number
  createdAt: string
  updatedAt: string
  itemCount?: number
  orderItems?: any[]
  cafe?: {
    name: string
    logo: string | null
    phone: string | null
  }
}

/**
 * Maps a Prisma order entity to API response format
 */
export function mapOrderToResponse(order: OrderEntity): OrderResponse {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    orderType: order.orderType,
    tableNumber: order.tableNumber,
    deliveryAddress: order.deliveryAddress,
    deliveryLatitude: order.deliveryLatitude,
    deliveryLongitude: order.deliveryLongitude,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentReferenceId: order.paymentReferenceId,
    specialInstructions: order.specialInstructions,
    subtotal: order.subtotal,
    tax: order.tax,
    deliveryCharge: order.deliveryCharge,
    discount: order.discount,
    couponCode: order.couponCode,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    itemCount: order.itemCount || order.orderItems?.length || 0,
    orderItems: order.orderItems,
    cafe: order.cafe
  }
}

/**
 * Maps multiple orders to response format
 */
export function mapOrdersToResponse(orders: OrderEntity[]): OrderResponse[] {
  return orders.map(mapOrderToResponse)
}