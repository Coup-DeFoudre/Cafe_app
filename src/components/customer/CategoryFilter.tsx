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
      <TabsList className="flex w-full gap-3 overflow-x-auto lg:flex-wrap lg:h-auto bg-transparent p-0">
        <TabsTrigger 
          value="all" 
          className="flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-2 data-[state=active]:bg-secondary data-[state=active]:text-white border border-border data-[state=active]:border-secondary transition-all"
        >
          All
          <Badge variant="secondary" className="text-xs bg-white/20">
            {categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0)}
          </Badge>
        </TabsTrigger>
        
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="flex items-center gap-2 whitespace-nowrap rounded-full px-6 py-2 data-[state=active]:bg-secondary data-[state=active]:text-white border border-border data-[state=active]:border-secondary transition-all"
          >
            {category.name}
            {category.itemCount !== undefined && (
              <Badge variant="secondary" className="text-xs bg-white/20">
                {category.itemCount}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}