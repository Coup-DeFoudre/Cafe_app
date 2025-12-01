import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { DEFAULT_CAFE_SLUG } from '@/lib/constants';
import CheckoutPageClient from '@/components/customer/CheckoutPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Checkout | Cafe App',
  description: 'Complete your order and provide delivery details',
};

export default async function CheckoutPage() {
  // Fetch cafe and settings
  const cafe = await prisma.cafe.findUnique({
    where: {
      slug: DEFAULT_CAFE_SLUG,
    },
    include: {
      settings: true,
    },
  });

  if (!cafe) {
    throw new Error('Cafe not found');
  }

  return <CheckoutPageClient cafeSettings={cafe.settings} />;
}