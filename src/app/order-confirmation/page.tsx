import { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Order Confirmation | Cafe App',
  description: 'Your order has been placed successfully',
};

export default function OrderConfirmationPage() {
  // Redirect to the customer route structure
  redirect('/customer/my-cafe');
}