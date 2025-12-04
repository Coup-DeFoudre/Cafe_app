'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { OrderType } from '@/types';
import { calculateSubtotal, calculateTax, calculateTotal } from '@/lib/utils/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AppliedCoupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

interface CheckoutSummaryProps {
  className?: string;
  cafeSettings?: any;
  orderType?: OrderType;
  appliedCoupon?: AppliedCoupon | null;
  onCouponApply?: (coupon: AppliedCoupon) => void;
  onCouponRemove?: () => void;
}

export default function CheckoutSummary({ 
  className, 
  cafeSettings, 
  orderType = OrderType.DINE_IN,
  appliedCoupon,
  onCouponApply,
  onCouponRemove,
}: CheckoutSummaryProps) {
  const { items } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState('');
  
  const subtotal = calculateSubtotal(items);
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = cafeSettings?.taxEnabled ? calculateTax(discountedSubtotal, cafeSettings.taxRate) : 0;
  const deliveryCharge = orderType === OrderType.DELIVERY ? (cafeSettings?.deliveryCharge || 0) : 0;
  const total = calculateTotal(discountedSubtotal, tax, deliveryCharge);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    setCouponError('');

    try {
      // Send cart items for server-side subtotal calculation
      // This ensures consistency with order creation validation
      const cartItems = items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode.trim(),
          subtotal: subtotal,
          items: cartItems,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        const coupon: AppliedCoupon = {
          id: data.coupon.id,
          code: data.coupon.code,
          description: data.coupon.description,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
          discountAmount: data.discountAmount,
        };
        onCouponApply?.(coupon);
        setCouponCode('');
        toast.success('Coupon applied!', {
          description: `You saved ${formatCurrency(data.discountAmount)}`,
        });
      } else {
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemove?.();
    toast.info('Coupon removed');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.menuItemId} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <Badge 
                    variant={item.isVeg ? "default" : "destructive"} 
                    className="text-xs"
                  >
                    {item.isVeg ? "VEG" : "NON-VEG"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <div className="font-medium text-sm">
                {formatCurrency(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Promo Code Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" />
            <span>Promo Code</span>
          </div>
          
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                <p className="text-sm text-green-600">
                  {appliedCoupon.discountType === 'PERCENTAGE' 
                    ? `${appliedCoupon.discountValue}% off`
                    : `${formatCurrency(appliedCoupon.discountValue)} off`
                  }
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveCoupon}
                className="text-green-700 hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleApplyCoupon}
                  disabled={isValidating || !couponCode.trim()}
                  variant="outline"
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              </div>
              {couponError && (
                <p className="text-sm text-red-500">{couponError}</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
          {appliedCoupon && discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({appliedCoupon.code})</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          
          {cafeSettings?.taxEnabled && (
            <div className="flex justify-between text-sm">
              <span>Tax ({cafeSettings.taxRate}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          
          {orderType === OrderType.DELIVERY && deliveryCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span>Delivery Charge</span>
              <span>{formatCurrency(deliveryCharge)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
