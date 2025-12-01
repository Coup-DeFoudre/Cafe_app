'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, ArrowLeft, Home, Loader2, AlertCircle, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { OrderResponse, OrderStatus, PaymentMethod, PaymentStatus, OrderType } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealtimeOrderStatus } from '@/hooks/useRealtimeOrderStatus';

interface OrderConfirmationPageClientProps {
  orderId: string;
  cafeSlug: string;
}

export default function OrderConfirmationPageClient({ orderId, cafeSlug }: OrderConfirmationPageClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Order not found');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch order details');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setOrder(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch order details');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error instanceof Error ? error.message : 'Failed to load order details');
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Real-time status update handler
  const handleStatusUpdate = useCallback((data: { orderId: string; status: OrderStatus; orderNumber: string }) => {
    setOrder(prev => {
      if (!prev) return null
      
      // Show toast notification for status change
      toast.info(`Order status updated to ${data.status.replace('_', ' ')}`)
      
      return {
        ...prev,
        status: data.status
      }
    })
  }, [])

  // Subscribe to real-time status updates
  const { isConnected } = useRealtimeOrderStatus(
    order?.cafe?.id || '',
    orderId,
    handleStatusUpdate
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'text-yellow-600 bg-yellow-50';
      case OrderStatus.CONFIRMED:
        return 'text-blue-600 bg-blue-50';
      case OrderStatus.PREPARING:
        return 'text-orange-600 bg-orange-50';
      case OrderStatus.READY:
        return 'text-green-600 bg-green-50';
      case OrderStatus.COMPLETED:
        return 'text-green-700 bg-green-100';
      case OrderStatus.CANCELLED:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPaymentMethodDisplay = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Cash';
      case PaymentMethod.ONLINE:
        return 'Online Payment';
      default:
        return method;
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'text-yellow-600 bg-yellow-50';
      case PaymentStatus.PAID:
        return 'text-green-600 bg-green-50';
      case PaymentStatus.FAILED:
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleGoHome = () => {
    router.push(`/customer/${cafeSlug}`);
  };

  const handleViewMenu = () => {
    router.push(`/customer/${cafeSlug}/menu`);
  };

  const handleGoBack = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-red-600 mb-2">
                Order Not Found
              </h1>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleGoBack} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={handleViewMenu}>
                  View Menu
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-red-600 mb-2">
                Order Not Found
              </h1>
              <p className="text-muted-foreground mb-6">
                The order you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleGoBack} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
                <Button onClick={handleViewMenu}>
                  View Menu
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your order. We&apos;ll start preparing it shortly.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Order Number
                </label>
                <p className="text-lg font-mono font-semibold">{order.orderNumber}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  Status
                  {isConnected && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <Wifi className="w-3 h-3" />
                      Live
                    </span>
                  )}
                </label>
                <div className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 transition-all duration-300",
                  getStatusColor(order.status)
                )}>
                  {order.status.replace('_', ' ')}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Customer Name
                </label>
                <p className="text-base">{order.customerName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </label>
                <p className="text-base">{order.customerPhone}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Order Type
                </label>
                <p className="text-base">{order.orderType.replace('_', ' ')}</p>
              </div>

              {order.orderType === OrderType.DINE_IN && order.tableNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Table Number
                  </label>
                  <p className="text-base">{order.tableNumber}</p>
                </div>
              )}

              {order.orderType === OrderType.DELIVERY && order.deliveryAddress && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Delivery Address
                  </label>
                  <p className="text-base">{order.deliveryAddress}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Payment Method
                </label>
                <p className="text-base">{getPaymentMethodDisplay(order.paymentMethod)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Payment Status
                </label>
                <div className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1",
                  getPaymentStatusColor(order.paymentStatus)
                )}>
                  {order.paymentStatus}
                </div>
              </div>

              {order.paymentReferenceId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Payment Reference ID
                  </label>
                  <p className="text-base font-mono">{order.paymentReferenceId}</p>
                </div>
              )}

              {order.specialInstructions && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Special Instructions
                  </label>
                  <p className="text-base">{order.specialInstructions}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Order Time
                </label>
                <p className="text-base">
                  {new Date(order.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatPrice(item.price)}
                      </p>
                      {item.customizations?.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          Notes: {item.customizations.notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                {order.deliveryCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery Charge:</span>
                    <span>{formatPrice(order.deliveryCharge)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cafe Information */}
          {order.cafe && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Cafe Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Name:</span> {order.cafe.name}
                  </div>
                  {order.cafe.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {order.cafe.phone}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={handleViewMenu}>
              View Menu Again
            </Button>
            <Button onClick={handleGoHome} variant="outline">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}