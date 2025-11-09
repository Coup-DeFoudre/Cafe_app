import { OrderStatus } from '@prisma/client'
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package, 
  CheckCheck, 
  XCircle,
  LucideIcon 
} from 'lucide-react'

export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return 'bg-red-100 text-red-800 border-red-200'
    case OrderStatus.CONFIRMED:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case OrderStatus.PREPARING:
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case OrderStatus.READY:
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case OrderStatus.COMPLETED:
      return 'bg-green-100 text-green-800 border-green-200'
    case OrderStatus.CANCELLED:
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return 'Pending'
    case OrderStatus.CONFIRMED:
      return 'Confirmed'
    case OrderStatus.PREPARING:
      return 'Preparing'
    case OrderStatus.READY:
      return 'Ready'
    case OrderStatus.COMPLETED:
      return 'Completed'
    case OrderStatus.CANCELLED:
      return 'Cancelled'
    default:
      return status
  }
}

export function getNextOrderStatuses(currentStatus: OrderStatus): OrderStatus[] {
  switch (currentStatus) {
    case OrderStatus.PENDING:
      return [OrderStatus.CONFIRMED, OrderStatus.CANCELLED]
    case OrderStatus.CONFIRMED:
      return [OrderStatus.PREPARING, OrderStatus.CANCELLED]
    case OrderStatus.PREPARING:
      return [OrderStatus.READY, OrderStatus.CANCELLED]
    case OrderStatus.READY:
      return [OrderStatus.COMPLETED, OrderStatus.CANCELLED]
    case OrderStatus.COMPLETED:
      return [] // Terminal state
    case OrderStatus.CANCELLED:
      return [] // Terminal state
    default:
      return []
  }
}

export function canTransitionStatus(from: OrderStatus, to: OrderStatus): boolean {
  const nextStatuses = getNextOrderStatuses(from)
  return nextStatuses.includes(to)
}

export function getOrderStatusIcon(status: OrderStatus): LucideIcon {
  switch (status) {
    case OrderStatus.PENDING:
      return Clock
    case OrderStatus.CONFIRMED:
      return CheckCircle
    case OrderStatus.PREPARING:
      return ChefHat
    case OrderStatus.READY:
      return Package
    case OrderStatus.COMPLETED:
      return CheckCheck
    case OrderStatus.CANCELLED:
      return XCircle
    default:
      return Clock
  }
}