
import { OrderStatus, PaymentMethod, PaymentStatus, OrderType } from '@prisma/client'

// Re-export Prisma enums
export { OrderStatus, PaymentMethod, PaymentStatus, OrderType }

// Admin Role Enum
export type AdminRole = "OWNER" | "MANAGER" | "STAFF"

// Cart Item Interface
export interface CartItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  image?: string
  customizations?: Record<string, any>
  isVeg?: boolean
}

// Order Item Interface (extends CartItem)
export interface OrderItem extends CartItem {
  subtotal: number
}

// Create Order Input Interface
export interface CreateOrderInput {
  cafeId: string
  customerName: string
  customerPhone: string
  orderType: OrderType
  tableNumber?: string
  deliveryAddress?: string
  items: OrderItem[]
  paymentMethod: PaymentMethod
  paymentReferenceId?: string
  specialInstructions?: string
}

// Cafe Settings Interface
export interface CafeSettings {
  deliveryEnabled: boolean
  deliveryCharge: number
  minOrderValue: number
  taxRate: number
  taxEnabled: boolean
  onlinePaymentEnabled: boolean
  paymentQrCode?: string
  upiId?: string
  currency: string
  currencySymbol: string
}

// Theme Colors Interface
export interface ThemeColors {
  primary: string
  secondary: string
  accent?: string
}

// Business Hours Interface
export interface BusinessHours {
  [day: string]: {
    open: string
    close: string
    closed: boolean
  }
}

// Social Links Interface
export interface SocialLinks {
  facebook?: string
  instagram?: string
  twitter?: string
  whatsapp?: string
  website?: string
}

// Menu Item Customization Interface
export interface MenuItemCustomization {
  name: string
  type: "size" | "addon" | "variant"
  options: CustomizationOption[]
  required: boolean
  multiSelect: boolean
}

export interface CustomizationOption {
  name: string
  price: number
  isDefault?: boolean
}

// Order Summary Interface
export interface OrderSummary {
  subtotal: number
  tax: number
  deliveryCharge: number
  discount: number
  total: number
}

// Dashboard Stats Interface
export interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  todayRevenue: number
  totalCustomers: number
  popularItems: {
    name: string
    count: number
  }[]
}

// API Response Interface
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination Interface
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Filter Options Interface
export interface FilterOptions {
  status?: OrderStatus[]
  orderType?: OrderType[]
  paymentMethod?: PaymentMethod[]
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

// Order API Response Interfaces
export interface OrderResponse {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  orderType: OrderType
  tableNumber: string | null
  deliveryAddress: string | null
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentReferenceId: string | null
  specialInstructions: string | null
  subtotal: number
  tax: number
  deliveryCharge: number
  total: number
  createdAt: string
  cafe: {
    id: string
    name: string
    logo: string | null
    phone: string | null
  }
  orderItems: OrderItemResponse[]
}

export interface OrderItemResponse {
  id: string
  name: string
  price: number
  quantity: number
  subtotal: number
  image: string | null
  customizations: any
}

export interface CreateOrderResponse {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  message: string
}

// Extended Order interfaces for admin management
export interface OrderWithDetails extends OrderResponse {
  updatedAt: string
  orderItems: OrderItemWithMenuDetails[]
}

export interface OrderItemWithMenuDetails extends OrderItemResponse {
  menuItem: {
    id: string
    name: string
    image: string | null
    category: {
      name: string
    }
  }
}

// Order filter and pagination interfaces
export interface OrderFilters {
  status?: OrderStatus | 'ALL'
  orderType?: OrderType | 'ALL'
  paymentMethod?: PaymentMethod | 'ALL'
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface OrderListResponse {
  orders: OrderWithDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: {
    totalOrders: number
    pendingOrders: number
    todayRevenue: number
    completedToday: number
  }
}

// Order status update interface
export interface OrderStatusUpdate {
  status: OrderStatus
  notes?: string
}

// Order notification interface
export interface OrderNotification {
  id: string
  orderNumber: string
  customerName: string
  total: number
  orderType: OrderType
  status: OrderStatus
  createdAt: string
}

/**
 * Real-time event payload for order status updates
 * Used in Pusher WebSocket events
 */
export interface OrderStatusUpdateEvent {
  orderId: string
  status: OrderStatus
  orderNumber: string
}

/**
 * Union type for all Pusher events
 */
export type PusherEvent = 
  | { event: 'order-created'; data: OrderNotification }
  | { event: 'order-status-updated'; data: OrderStatusUpdateEvent }

// Admin order list specific interfaces
export interface OrderListItem {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  orderType: OrderType
  tableNumber: string | null
  deliveryAddress: string | null
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  total: number
  createdAt: string
  updatedAt: string
  itemCount: number
}

export interface OrderFiltersState {
  status: OrderStatus[]
  orderType: OrderType | null
  paymentMethod: PaymentMethod | null
  search: string
  dateFrom: string | null
  dateTo: string | null
}

export interface OrdersApiResponse {
  orders: OrderListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Print receipt interface
export interface PrintReceiptData {
  orderNumber: string
  customerName: string
  customerPhone: string
  orderType: OrderType
  tableNumber?: string
  deliveryAddress?: string
  orderItems: OrderItemWithMenuDetails[]
  subtotal: number
  tax: number
  deliveryCharge: number
  total: number
  paymentMethod: PaymentMethod
  specialInstructions?: string
  createdAt: string
  cafe: {
    name: string
    phone?: string
    address?: string
  }
}

// Settings Management Interfaces
export interface CafeWithSettings {
  id: string
  name: string
  subdomain: string
  slug: string
  logo: string | null
  bannerImage: string | null
  tagline: string | null
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  businessHours: BusinessHours | null
  socialLinks: SocialLinks | null
  themeColors: ThemeColors | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  settings: {
    id: string
    cafeId: string
    deliveryEnabled: boolean
    deliveryCharge: number
    minOrderValue: number
    taxRate: number
    taxEnabled: boolean
    onlinePaymentEnabled: boolean
    paymentQrCode: string | null
    upiId: string | null
    currency: string
    currencySymbol: string
    createdAt: Date
    updatedAt: Date
  } | null
}

export interface UpdateCafeInfoInput {
  name: string
  tagline?: string | null
  description?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
}

export interface UpdateBrandingInput {
  logo?: string | null
  bannerImage?: string | null
}

export interface UpdateSettingsInput {
  deliveryEnabled?: boolean
  deliveryCharge?: number
  minOrderValue?: number
  taxRate?: number
  taxEnabled?: boolean
  onlinePaymentEnabled?: boolean
  paymentQrCode?: string | null
  upiId?: string | null
}