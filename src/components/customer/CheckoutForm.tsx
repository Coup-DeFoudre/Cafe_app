'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { OrderType } from '@/types';
import { CheckoutFormSchema, type CheckoutFormData } from '@/lib/validations/checkout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  cafeSettings?: any;
  orderType?: OrderType;
}

export default function CheckoutForm({ 
  onSubmit, 
  isLoading = false, 
  className,
  cafeSettings,
  orderType
}: CheckoutFormProps) {
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      orderType: orderType || OrderType.DINE_IN,
      specialInstructions: '',
    },
  });

  const watchOrderType = form.watch('orderType');

  const handleSubmit = async (data: CheckoutFormData) => {
    // If order type is DINE_IN, remove deliveryAddress
    if (data.orderType === OrderType.DINE_IN) {
      delete data.deliveryAddress;
    }
    // If order type is DELIVERY, remove tableNumber
    if (data.orderType === OrderType.DELIVERY) {
      delete data.tableNumber;
    }
    
    await onSubmit(data);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Customer Information</h3>
              
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="Enter your phone number" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Order Type */}
            <div className="space-y-4">
              <h3 className="font-medium">Order Type</h3>
              
              <FormField
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                        disabled={isLoading}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={OrderType.DINE_IN} id="dine-in" />
                          <Label htmlFor="dine-in" className="font-normal">
                            Dine In
                          </Label>
                        </div>
                        {cafeSettings?.deliveryEnabled && (
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={OrderType.DELIVERY} id="delivery" />
                            <Label htmlFor="delivery" className="font-normal">
                              Delivery
                            </Label>
                          </div>
                        )}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Table Number - Only show for DINE_IN */}
              {watchOrderType === OrderType.DINE_IN && (
                <FormField
                  control={form.control}
                  name="tableNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your table number" 
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Delivery Address - Only show for DELIVERY */}
              {watchOrderType === OrderType.DELIVERY && (
                <FormField
                  control={form.control}
                  name="deliveryAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your complete delivery address..." 
                          className="resize-none" 
                          rows={3}
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Special Instructions */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special requests or dietary requirements..." 
                        className="resize-none" 
                        rows={3}
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating Order...
                </>
              ) : (
                'Validate Order Details'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}