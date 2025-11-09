'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';

export default function CartButton() {
  const { itemCount, openCart } = useCart();

  if (itemCount === 0) {
    return null;
  }

  return (
    <Button
      onClick={openCart}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 md:top-6 md:bottom-auto z-50 rounded-full shadow-lg hover:shadow-xl",
        "transition-all duration-200 animate-bounce"
      )}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {itemCount}
          </Badge>
        )}
      </div>
    </Button>
  );
}