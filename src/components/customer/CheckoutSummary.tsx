'use client';

import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { OrderType } from '@/types';
import { calculateSubtotal, calculateTax, calculateTotal } from '@/lib/utils/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface CheckoutSummaryProps {
  className?: string;
  cafeSettings?: any;
  orderType?: OrderType;
}

export default function CheckoutSummary({ 
  className, 
  cafeSettings, 
  orderType = OrderType.DINE_IN 
}: CheckoutSummaryProps) {
  const { items } = useCart();
  
  const subtotal = calculateSubtotal(items);
  const tax = cafeSettings?.taxEnabled ? calculateTax(subtotal, cafeSettings.taxRate) : 0;
  const deliveryCharge = orderType === OrderType.DELIVERY ? (cafeSettings?.deliveryCharge || 0) : 0;
  const total = calculateTotal(subtotal, tax, deliveryCharge);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

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

        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          
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
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}