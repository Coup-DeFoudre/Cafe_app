import { useState, useMemo } from 'react';
import type { MenuItemWithCategory } from '@/types/menu';

interface UseMenuFiltersParams {
  items: MenuItemWithCategory[];
}

export default function useMenuFilters({ items }: UseMenuFiltersParams) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query)
      );
    }

    // Filter by veg preference
    if (vegFilter === 'veg') {
      filtered = filtered.filter(item => item.isVeg === true);
    } else if (vegFilter === 'nonveg') {
      filtered = filtered.filter(item => item.isVeg === false);
    }

    return filtered;
  }, [items, selectedCategory, searchQuery, vegFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setVegFilter('all');
  };

  return {
    filteredItems,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    vegFilter,
    setVegFilter,
    itemCount: filteredItems.length,
    resetFilters,
  };
}