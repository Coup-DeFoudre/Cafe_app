'use client'

import { Badge } from '@/components/ui/badge'
import { getOrderStatusColor, getOrderStatusLabel, getOrderStatusIcon } from '@/lib/utils/order-status'
import { OrderStatus } from '@prisma/client'
import { cn } from '@/lib/utils'

interface OrderStatusBadgeProps {
  status: OrderStatus
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function OrderStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className 
}: OrderStatusBadgeProps) {
  const color = getOrderStatusColor(status)
  const label = getOrderStatusLabel(status)
  const Icon = getOrderStatusIcon(status)

  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-2.5', 
    lg: 'text-base py-1.5 px-3'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <Badge 
      variant="outline"
      className={cn(
        'flex items-center gap-1.5 border rounded-full font-medium',
        color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {label}
    </Badge>
  )
}