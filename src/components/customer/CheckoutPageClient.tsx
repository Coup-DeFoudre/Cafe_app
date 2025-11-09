'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { OrderType, PaymentMethod } from '@/types';
import { type CheckoutFormData } from '@/lib/validations/checkout';
import { calculateSubtotal, calculateTax, calculateTotal } from '@/lib/utils/order';
import { DEFAULT_CAFE_SLUG } from '@/lib/constants';
import CheckoutForm from '@/components/customer/CheckoutForm';
import CheckoutSummary from '@/components/customer/CheckoutSummary';
import PaymentMethodSelector from '@/components/customer/PaymentMethodSelector';
import OnlinePaymentForm from '@/components/customer/OnlinePaymentForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CheckoutPageClientProps {
  cafeSettings: any;
}

export default function CheckoutPageClient({ cafeSettings }: CheckoutPageClientProps) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [validatedCheckoutData, setValidatedCheckoutData] = useState<CheckoutFormData | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | undefined>();
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);

  // Calculate order totals
  const subtotal = calculateSubtotal(items);
  const deliveryCharge = validatedCheckoutData?.orderType === OrderType.DELIVERY ? (cafeSettings.deliveryCharge || 0) : 0;
  const tax = cafeSettings.taxEnabled ? calculateTax(subtotal, cafeSettings.taxRate) : 0;
  const total = calculateTotal(subtotal, tax, deliveryCharge);

  const handleCheckoutFormSubmit = async (data: CheckoutFormData) => {
    setValidatedCheckoutData(data);
    setCheckoutStep('payment');
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handleCompleteOrder = async (paymentReferenceId?: string) => {
    if (!validatedCheckoutData) {
      toast.error('Please complete the checkout form first');
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (selectedPaymentMethod === PaymentMethod.ONLINE && !paymentReferenceId) {
      toast.error('Please enter payment reference ID');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        customerName: validatedCheckoutData.customerName,
        customerPhone: validatedCheckoutData.customerPhone,
        orderType: validatedCheckoutData.orderType,
        specialInstructions: validatedCheckoutData.specialInstructions,
        paymentMethod: selectedPaymentMethod,
        paymentReferenceId: paymentReferenceId,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations
        })),
        subtotal,
        tax,
        total,
        deliveryCharge,
        ...(validatedCheckoutData.orderType === OrderType.DINE_IN && { tableNumber: validatedCheckoutData.tableNumber }),
        ...(validatedCheckoutData.orderType === OrderType.DELIVERY && { deliveryAddress: validatedCheckoutData.deliveryAddress }),
        cafeSlug: DEFAULT_CAFE_SLUG
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/customer/${DEFAULT_CAFE_SLUG}/order-confirmation/${result.data.id}`);
      } else {
        throw new Error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goBackToDetails = () => {
    setCheckoutStep('details');
  };

  const handleGoBack = () => {
    router.back();
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={checkoutStep === 'payment' ? goBackToDetails : handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {checkoutStep === 'payment' ? 'Back to Details' : 'Back'}
          </Button>
          <h1 className="text-2xl font-bold">
            {checkoutStep === 'details' ? 'Checkout Details' : 'Payment'}
          </h1>
        </div>

        {/* Content */}
        {checkoutStep === 'details' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              <CheckoutForm
                onSubmit={handleCheckoutFormSubmit}
                isLoading={isLoading}
                cafeSettings={cafeSettings}
                orderType={orderType}
              />
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <CheckoutSummary 
                cafeSettings={cafeSettings}
                orderType={orderType}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Selection */}
            <div className="space-y-6">
              <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onPaymentMethodChange={handlePaymentMethodChange}
                cafeSettings={cafeSettings}
              />
              
              {selectedPaymentMethod === PaymentMethod.ONLINE && (
                <OnlinePaymentForm
                  onSubmit={handleCompleteOrder}
                  isLoading={isLoading}
                  cafeSettings={cafeSettings}
                />
              )}
              
              {selectedPaymentMethod === PaymentMethod.CASH && (
                <Button
                  onClick={() => handleCompleteOrder()}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Placing Order...' : 'Place Order'}
                </Button>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <CheckoutSummary 
                cafeSettings={cafeSettings}
                orderType={validatedCheckoutData?.orderType || orderType}
              />
              
              {validatedCheckoutData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Name:</span> {validatedCheckoutData.customerName}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {validatedCheckoutData.customerPhone}
                    </div>
                    <div>
                      <span className="font-medium">Order Type:</span> {validatedCheckoutData.orderType.replace('_', ' ')}
                    </div>
                    {validatedCheckoutData.specialInstructions && (
                      <div>
                        <span className="font-medium">Special Instructions:</span> {validatedCheckoutData.specialInstructions}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}