'use client'

import { useEffect, useState, useCallback } from 'react'
import { Bell, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { OrderStatus, OrderType } from '@prisma/client'

interface NewOrderNotificationProps {
  order: {
    id: string
    orderNumber: string
    customerName: string
    total: number
    orderType: OrderType
    status: OrderStatus
    createdAt: string
  }
  onDismiss: () => void
  onViewOrder: () => void
}

export function NewOrderNotification({ 
  order, 
  onDismiss, 
  onViewOrder 
}: NewOrderNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) // Allow animation to complete
  }, [onDismiss])

  useEffect(() => {
    // Sound is already played by the hook, so we only handle auto-dismiss
    
    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      handleDismiss()
    }, 10000)

    return () => clearTimeout(timer)
  }, [handleDismiss])

  const handleViewOrder = () => {
    onViewOrder()
    handleDismiss()
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-96 animate-in slide-in-from-right-full duration-300">
      <Card className="border-2 border-blue-200 bg-blue-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">New Order Received!</h3>
                <p className="text-sm text-blue-700">Order #{order.orderNumber}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Customer:</span>
              <span className="font-medium text-blue-900">{order.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Type:</span>
              <Badge variant="secondary">
                {order.orderType === OrderType.DINE_IN ? 'Dine In' : 'Delivery'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Total:</span>
              <span className="font-bold text-blue-900">{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button 
              onClick={handleViewOrder}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              View Order
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}