'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency } from '@/lib/utils';
import { PLACEHOLDER_IMAGES, DIETARY_INDICATORS } from '@/lib/constants';
import type { MenuItemCardProps } from '@/types/menu';

// Static mapping for Tailwind classes to avoid runtime class generation
const badgeBg: Record<'green' | 'red', string> = {
  green: 'bg-green-600 hover:bg-green-700',
  red: 'bg-red-600 hover:bg-red-700',
};

const dotBg: Record<'green' | 'red', string> = {
  green: 'bg-green-200',
  red: 'bg-red-200',
};

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const { id, name, description, price, image, isAvailable, isVeg } = item;
  
  // Get dietary indicator based on veg status
  const indicator = isVeg ? DIETARY_INDICATORS.veg : DIETARY_INDICATORS.nonveg;

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:scale-[1.02] border-0 shadow-md hover:shadow-xl bg-white rounded-2xl",
      !isAvailable && "opacity-60"
    )}>
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F5F1EA]">
        <Image
          src={image || PLACEHOLDER_IMAGES.menuItem}
          alt={name}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-110"
        />

        {/* Veg/Non-Veg Badge */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={isVeg ? "default" : "destructive"}
            className={cn(
              "text-xs font-medium",
              badgeBg[indicator.color as 'green' | 'red']
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full mr-1",
              dotBg[indicator.color as 'green' | 'red']
            )} />
            {indicator.label.toUpperCase()}
          </Badge>
        </div>

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1 mb-2 text-[#2D2D2D]">{name}</h3>
        {description && (
          <p className="text-sm text-[#6B6B6B] line-clamp-2 mb-3">
            {description}
          </p>
        )}
        <div className="text-2xl font-bold text-[#8B4513]">
          {formatCurrency(price)}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        {isAvailable ? (
          <Button
            onClick={() => onAddToCart(item)}
            className="w-full bg-[#3D3D3D] hover:bg-[#2D2D2D] text-white rounded-full"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        ) : (
          <Button
            disabled
            className="w-full rounded-full"
            size="sm"
            variant="secondary"
          >
            Out of Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
