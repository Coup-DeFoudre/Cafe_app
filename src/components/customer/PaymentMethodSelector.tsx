'use client';

import { Banknote, CreditCard } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PaymentMethodSelectorProps {
  onPaymentMethodChange: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
  cafeSettings: any;
  isLoading?: boolean;
}

export default function PaymentMethodSelector({
  onPaymentMethodChange,
  selectedMethod,
  cafeSettings,
  isLoading = false
}: PaymentMethodSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedMethod}
          onValueChange={onPaymentMethodChange}
          disabled={isLoading}
          className="space-y-4"
        >
          {/* Cash on Delivery */}
          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value={PaymentMethod.CASH} id="cash" />
            <Banknote className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <Label htmlFor="cash" className="font-medium cursor-pointer">
                Cash on Delivery
              </Label>
              <p className="text-sm text-muted-foreground">
                Pay with cash when your order arrives
              </p>
            </div>
          </div>

          {/* Online Payment - Only show if enabled */}
          {cafeSettings?.onlinePaymentEnabled && (
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <RadioGroupItem value={PaymentMethod.ONLINE} id="online" />
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <Label htmlFor="online" className="font-medium cursor-pointer">
                  Online Payment
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pay instantly using UPI or QR code
                </p>
              </div>
            </div>
          )}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}