import { Metadata } from 'next';
import { Suspense } from 'react';
import OrderConfirmationPageClient from '@/components/customer/OrderConfirmationPageClient';

export const metadata: Metadata = {
  title: 'Order Confirmation | Cafe App',
  description: 'Your order has been placed successfully',
};

interface OrderConfirmationPageProps {
  params: {
    cafeSlug: string;
    orderId: string;
  };
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderConfirmationPageClient orderId={params.orderId} cafeSlug={params.cafeSlug} />
    </Suspense>
  );
}