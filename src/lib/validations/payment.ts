import { z } from 'zod';
import { PaymentMethod } from '@/types';

export const PaymentFormSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentReferenceId: z.string().optional(),
}).refine(d => d.paymentMethod !== PaymentMethod.ONLINE || (!!d.paymentReferenceId && d.paymentReferenceId.length >= 6), {
  message: 'Payment reference ID is required for online payments and must be at least 6 characters long',
  path: ['paymentReferenceId']
});

export type PaymentFormData = z.infer<typeof PaymentFormSchema>;