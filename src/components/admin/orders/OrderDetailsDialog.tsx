'use client'

import { X, Printer, User, Phone, MapPin, UtensilsCrossed, Truck } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderStatusUpdater } from './OrderStatusUpdater'
import { printOrderReceipt } from '@/lib/utils/print'
import { formatCurrency, getRelativeTime } from '@/lib/utils'
import { OrderStatus, OrderType, PaymentMethod } from '@prisma/client'
import { OrderResponse } from '@/lib/mappers/order'
import Image from 'next/image'

interface OrderDetailsDialogProps {
  order: OrderResponse | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: () => void
}

export function OrderDetailsDialog({ 
  order, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}: OrderDetailsDialogProps) {
  if (!order) return null

  const handlePrint = () => {
    printOrderReceipt(order)
  }

  const isTerminalStatus = order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold">
                Order #{order.orderNumber}
              </DialogTitle>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a 
                  href={`tel:${order.customerPhone}`}
                  className="text-blue-600 hover:underline"
                >
                  {order.customerPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                {order.orderType === OrderType.DINE_IN ? (
                  <>
                    <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                    <span>Dine In</span>
                    {order.tableNumber && (
                      <Badge variant="secondary">Table {order.tableNumber}</Badge>
                    )}
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-gray-400" />
                    <span>Delivery</span>
                  </>
                )}
              </div>
              {order.deliveryAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm">{order.deliveryAddress}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems?.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      {item.menuItem?.image ? (
                        <Image
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.menuItem?.name}</h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                      {item.customizations && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Customizations:</span> {item.customizations}
                        </p>
                      )}
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.quantity * item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Payment Method:</span>
                <Badge variant="outline">
                  {order.paymentMethod === PaymentMethod.CASH ? 'Cash' : 'Online'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Payment Status:</span>
                <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'destructive'}>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.paymentReferenceId && (
                <div className="flex items-center justify-between">
                  <span>Reference ID:</span>
                  <span className="font-mono text-sm">{order.paymentReferenceId}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal || order.total * 0.9)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax || order.total * 0.1)}</span>
                </div>
                {order.deliveryCharge > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Delivery Charge:</span>
                    <span>{formatCurrency(order.deliveryCharge)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  {order.specialInstructions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Created:</span>
                <span className="font-medium" title={new Date(order.createdAt).toLocaleString()}>
                  {getRelativeTime(new Date(order.createdAt))}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Last Updated:</span>
                <span className="font-medium" title={new Date(order.updatedAt).toLocaleString()}>
                  {getRelativeTime(new Date(order.updatedAt))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status Update Section */}
          {!isTerminalStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Update Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusUpdater
                  orderId={order.id}
                  currentStatus={order.status}
                  onStatusUpdate={onStatusUpdate}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}