'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PLACEHOLDER_IMAGES } from '@/lib/constants';
import type { MenuItemWithCategory } from '@/types/menu';

interface TodaysSpecialProps {
  items: MenuItemWithCategory[];
  onAddToCart: (item: MenuItemWithCategory) => void;
}

export default function TodaysSpecial({ items, onAddToCart }: TodaysSpecialProps) {
  // Take first 4 available items as specials
  const specialItems = items.filter(item => item.isAvailable !== false).slice(0, 4);

  if (specialItems.length === 0) {
    return null;
  }

  return (
    <section id="specials" className="py-12 px-4 bg-[#FAF7F2]">
      <div className="container mx-auto">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-8">
          Today&apos;s Special
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {specialItems.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-[#F5F1EA]">
                <Image
                  src={item.image || PLACEHOLDER_IMAGES.menuItem}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {/* Quick Add Button */}
                <button
                  onClick={() => onAddToCart(item)}
                  className="absolute bottom-3 right-3 w-10 h-10 bg-[#3D3D3D] hover:bg-[#2D2D2D] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Add to cart"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-[#2D2D2D] text-sm md:text-base mb-1 line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-[#8B4513] font-semibold">
                    {formatCurrency(item.price)}
                  </p>
                  {item.isVeg !== undefined && (
                    <span className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
