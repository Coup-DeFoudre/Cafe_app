'use client';

import { Coffee, Cookie, Cake, GlassWater, UtensilsCrossed, Salad, Sandwich, IceCream } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string | null;
  itemCount?: number;
}

interface CategoryCardsProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
}

// Map category names to icons (case-insensitive)
const getCategoryIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('coffee') || lowerName.includes('beverage') || lowerName.includes('drink') || lowerName.includes('tea')) {
    return Coffee;
  }
  if (lowerName.includes('snack') || lowerName.includes('bite') || lowerName.includes('appetizer')) {
    return Cookie;
  }
  if (lowerName.includes('dessert') || lowerName.includes('sweet') || lowerName.includes('cake')) {
    return Cake;
  }
  if (lowerName.includes('juice') || lowerName.includes('smoothie') || lowerName.includes('shake')) {
    return GlassWater;
  }
  if (lowerName.includes('salad') || lowerName.includes('healthy')) {
    return Salad;
  }
  if (lowerName.includes('sandwich') || lowerName.includes('burger') || lowerName.includes('wrap')) {
    return Sandwich;
  }
  if (lowerName.includes('ice') || lowerName.includes('frozen')) {
    return IceCream;
  }
  // Default icon
  return UtensilsCrossed;
};

// Generate a short description based on category name
const getDefaultDescription = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('coffee') || lowerName.includes('tea')) {
    return 'Brewed to perfection';
  }
  if (lowerName.includes('snack') || lowerName.includes('bite')) {
    return 'Light & delicious';
  }
  if (lowerName.includes('dessert') || lowerName.includes('sweet')) {
    return 'Sweet treats to enjoy';
  }
  if (lowerName.includes('juice') || lowerName.includes('beverage')) {
    return 'Fresh & refreshing';
  }
  if (lowerName.includes('main') || lowerName.includes('meal')) {
    return 'Hearty & satisfying';
  }
  return 'Carefully crafted';
};

export default function CategoryCards({ categories, onCategoryClick }: CategoryCardsProps) {
  // Show up to 4 categories
  const displayCategories = categories.slice(0, 4);

  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-[#FAF7F2]">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayCategories.map((category) => {
            const Icon = getCategoryIcon(category.name);
            const description = category.description || getDefaultDescription(category.name);
            
            return (
              <div
                key={category.id}
                className="bg-[#F5F1EA] rounded-2xl p-5 md:p-6 flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => onCategoryClick(category.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif font-semibold text-lg md:text-xl text-[#2D2D2D] mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs md:text-sm text-[#6B6B6B]">
                      {description}
                    </p>
                  </div>
                  <div className="text-[#8B7355]">
                    <Icon className="w-10 h-10 md:w-12 md:h-12 stroke-[1.5]" />
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <button
                    className="px-5 py-2 bg-[#3D3D3D] text-white text-sm font-medium rounded-full hover:bg-[#2D2D2D] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCategoryClick(category.id);
                    }}
                  >
                    View
                  </button>
                  {category.itemCount !== undefined && (
                    <span className="text-xs text-[#8B7355] font-medium">
                      {category.itemCount} items
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
