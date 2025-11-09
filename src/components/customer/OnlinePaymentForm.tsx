'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { Copy, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentFormSchema, type PaymentFormData } from '@/lib/validations/payment';
import { PaymentMethod } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface OnlinePaymentFormProps {
  cafeSettings: any;
  onSubmit: (paymentReferenceId: string) => Promise<void>;
  isLoading?: boolean;
  onBack?: () => void;
}

export default function OnlinePaymentForm({
  cafeSettings,
  onSubmit,
  isLoading = false,
  onBack
}: OnlinePaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      paymentMethod: PaymentMethod.ONLINE,
      paymentReferenceId: '',
    },
  });

  const handleSubmit = async (data: PaymentFormData) => {
    if (data.paymentReferenceId) {
      await onSubmit(data.paymentReferenceId);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('UPI ID copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy UPI ID');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle>Complete Online Payment</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Section */}
        {cafeSettings?.paymentQrCode && (
          <div className="text-center space-y-4">
            <h3 className="font-medium">Scan QR Code to Pay</h3>
            <div className="flex justify-center">
              <Image
                src={cafeSettings.paymentQrCode}
                alt="Payment QR Code"
                width={300}
                height={300}
                className="border rounded-lg"
              />
            </div>
          </div>
        )}

        {/* UPI ID Section */}
        {cafeSettings?.upiId && (
          <div className="space-y-4">
            <h3 className="font-medium">Or Pay Using UPI ID</h3>
            <div className="flex gap-2">
              <Input
                value={cafeSettings.upiId}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(cafeSettings.upiId)}
                disabled={isLoading}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Reference ID Input */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="paymentReferenceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Reference ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the transaction ID from your payment app"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Enter the transaction ID from your payment app after completing the payment
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing Order...
                </>
              ) : (
                'Complete Order'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}