'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface CategoryFilterProps {
  categories: {
    id: string;
    name: string;
    description?: string | null;
    itemCount?: number;
  }[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  return (
    <Tabs value={selectedCategory} onValueChange={onCategoryChange} className="w-full">
      <TabsList className="flex w-full gap-2 overflow-x-auto lg:flex-wrap lg:h-auto">
        <TabsTrigger 
          value="all" 
          className="flex items-center gap-2 whitespace-nowrap"
        >
          All
          <Badge variant="secondary" className="text-xs">
            {categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0)}
          </Badge>
        </TabsTrigger>
        
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            {category.name}
            {category.itemCount !== undefined && (
              <Badge variant="secondary" className="text-xs">
                {category.itemCount}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}