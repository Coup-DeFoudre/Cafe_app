'use client'

import { User, Phone, ShoppingBag, UtensilsCrossed, Truck, Banknote, CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from './OrderStatusBadge'
import { formatCurrency, getRelativeTime } from '@/lib/utils'
import { OrderStatus, OrderType, PaymentMethod } from '@prisma/client'
import { OrderListItem } from '@/types'

interface OrderCardProps {
  order: OrderListItem
  onClick: () => void
}

export function OrderCard({ order, onClick }: OrderCardProps) {
  const timeAgo = getRelativeTime(new Date(order.createdAt))
  
  return (
    <Card 
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4"
      style={{
        borderLeftColor: order.status === OrderStatus.PENDING ? '#ef4444' :
                         order.status === OrderStatus.CONFIRMED ? '#3b82f6' :
                         order.status === OrderStatus.PREPARING ? '#f97316' :
                         order.status === OrderStatus.READY ? '#8b5cf6' :
                         order.status === OrderStatus.COMPLETED ? '#10b981' : '#6b7280'
      }}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">
            #{order.orderNumber}
          </h3>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status as OrderStatus} size="sm" />
          </div>
        </div>

        {/* Time */}
        <p className="text-xs text-gray-500">{timeAgo}</p>

        {/* Customer Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-700">{order.customerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{order.customerPhone}</span>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {order.orderType === OrderType.DINE_IN ? (
                <>
                  <UtensilsCrossed className="w-3 h-3" />
                  Dine In
                </>
              ) : (
                <>
                  <Truck className="w-3 h-3" />
                  Delivery
                </>
              )}
            </Badge>
            
            {order.orderType === OrderType.DINE_IN && order.tableNumber && (
              <Badge variant="secondary">
                Table {order.tableNumber}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <ShoppingBag className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              {order.paymentMethod === PaymentMethod.CASH ? (
                <>
                  <Banknote className="w-3 h-3" />
                  Cash
                </>
              ) : (
                <>
                  <CreditCard className="w-3 h-3" />
                  Online
                </>
              )}
            </Badge>
            
            {order.paymentMethod === PaymentMethod.ONLINE && (
              <Badge 
                variant={order.paymentStatus === 'PAID' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {order.paymentStatus}
              </Badge>
            )}
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}