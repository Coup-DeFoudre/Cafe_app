'use client';

import { forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import useMenuFilters from '@/hooks/useMenuFilters';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import VegNonVegFilter from './VegNonVegFilter';
import MenuGrid from './MenuGrid';
import CartButton from './CartButton';
import type { MenuBrowserProps, MenuItemWithCategory } from '@/types/menu';

export interface MenuBrowserRef {
  setCategory: (categoryId: string) => void;
}

const MenuBrowser = forwardRef<MenuBrowserRef, MenuBrowserProps>(({ categories, items }, ref) => {
  const { addItem } = useCart();
  
  // Add item count to categories
  const categoriesWithCount = categories.map(category => ({
    ...category,
    itemCount: category.menuItems.length,
  }));

  const {
    filteredItems,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    vegFilter,
    setVegFilter,
    itemCount,
    resetFilters,
  } = useMenuFilters({ items });

  // Expose the setSelectedCategory method to parent components
  useImperativeHandle(ref, () => ({
    setCategory: (categoryId: string) => {
      setSelectedCategory(categoryId);
    }
  }));

  const handleAddToCart = (item: MenuItemWithCategory) => {
    addItem(item);
    
    toast.success("Item added to cart", {
      description: `${item.name} has been added to your cart.`,
    });
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || vegFilter !== 'all';

  return (
    <div className="space-y-8">
      {/* Filter Controls Section */}
      <div className="sticky top-16 md:top-20 z-10 bg-[#FAF7F2] shadow-sm border-b border-[#E8E4DC] py-4 -mx-4 px-4 md:-mx-0 md:px-0 md:rounded-2xl md:bg-white md:border md:shadow-sm">
        <div className="container mx-auto px-0 md:px-6 space-y-4">
          {/* Search Bar */}
          <div className="flex justify-center">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search menu items..."
            />
          </div>

          {/* Category and Diet Filters */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex-1">
              <CategoryFilter
                categories={categoriesWithCount}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
            
            <div className="lg:w-auto">
              <VegNonVegFilter
                value={vegFilter}
                onChange={setVegFilter}
              />
            </div>
          </div>

          {/* Active Filters and Clear Button */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between py-2">
              <div className="text-sm text-[#6B6B6B]">
                {searchQuery && `Search: "${searchQuery}"`}
                {searchQuery && (selectedCategory !== 'all' || vegFilter !== 'all') && ' • '}
                {selectedCategory !== 'all' && `Category: ${categoriesWithCount.find(c => c.id === selectedCategory)?.name}`}
                {selectedCategory !== 'all' && vegFilter !== 'all' && ' • '}
                {vegFilter !== 'all' && `Diet: ${vegFilter === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="rounded-full border-[#3D3D3D] text-[#3D3D3D] hover:bg-[#3D3D3D] hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {/* Item Count */}
        <div className="text-center">
          <p className="text-lg font-medium text-[#2D2D2D]">
            Showing {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Menu Grid */}
        <MenuGrid
          items={filteredItems}
          isLoading={false}
          onAddToCart={handleAddToCart}
        />
      </div>
      
      {/* Floating Cart Button */}
      <CartButton />
    </div>
  );
});

MenuBrowser.displayName = 'MenuBrowser';

export default MenuBrowser;
