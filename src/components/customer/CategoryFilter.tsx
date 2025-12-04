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
      <TabsList className="flex w-full gap-2 md:gap-3 overflow-x-auto lg:flex-wrap lg:h-auto bg-transparent p-0">
        <TabsTrigger 
          value="all" 
          className="flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm data-[state=active]:bg-[#3D3D3D] data-[state=active]:text-white border border-[#E8E4DC] data-[state=active]:border-[#3D3D3D] transition-all bg-white hover:bg-[#F5F1EA]"
        >
          All
          <Badge variant="secondary" className="text-xs bg-[#F5F1EA] text-[#6B6B6B] data-[state=active]:bg-white/20 data-[state=active]:text-white">
            {categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0)}
          </Badge>
        </TabsTrigger>
        
        {categories.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.id}
            className="flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm data-[state=active]:bg-[#3D3D3D] data-[state=active]:text-white border border-[#E8E4DC] data-[state=active]:border-[#3D3D3D] transition-all bg-white hover:bg-[#F5F1EA]"
          >
            {category.name}
            {category.itemCount !== undefined && (
              <Badge variant="secondary" className="text-xs bg-[#F5F1EA] text-[#6B6B6B]">
                {category.itemCount}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
