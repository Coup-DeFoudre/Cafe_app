import { z } from 'zod';
import { OrderType } from '@/types';

const phoneRegex = /^\+?[1-9]\d{9,14}$/;

export const CheckoutFormSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  customerPhone: z.string().regex(phoneRegex, 'Invalid phone number'),
  orderType: z.nativeEnum(OrderType),
  tableNumber: z.string().optional(),
  deliveryAddress: z.string().optional(),
  specialInstructions: z.string().max(500, 'Special instructions must be less than 500 characters').optional(),
}).refine(d => d.orderType !== OrderType.DINE_IN || !!d.tableNumber, { 
  message: 'Table number is required for dine-in orders', 
  path: ['tableNumber'] 
}).refine(d => d.orderType !== OrderType.DELIVERY || (!!d.deliveryAddress && d.deliveryAddress.length >= 10), { 
  message: 'Delivery address is required for delivery orders', 
  path: ['deliveryAddress'] 
});

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>;