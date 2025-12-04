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
        "fixed bottom-24 right-6 z-50 rounded-full shadow-lg hover:shadow-xl",
        "bg-[#8B4513] hover:bg-[#6B3410] text-white",
        "transition-all duration-200 h-14 w-14 p-0"
      )}
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-[#3D3D3D]"
          >
            {itemCount}
          </Badge>
        )}
      </div>
    </Button>
  );
}
