import type { Cafe, MenuItem, MenuCategory, Settings } from '@prisma/client';
import type { CategoryWithCount, MenuItemWithCategory as QueryMenuItemWithCategory } from '@/lib/queries/menu';

export interface MenuItemWithCategory extends MenuItem {
  category: {
    name: string;
  };
}

export interface CategoryWithItems extends MenuCategory {
  menuItems: MenuItem[];
  itemCount: number;
}

export interface CafeWithSettings extends Cafe {
  settings: Settings | null;
}

export interface MenuFilters {
  searchQuery: string;
  selectedCategory: string;
  vegFilter: 'all' | 'veg' | 'nonveg';
}

export interface MenuBrowserProps {
  categories: CategoryWithItems[];
  items: MenuItemWithCategory[];
}

export interface MenuGridProps {
  items: MenuItemWithCategory[];
  isLoading: boolean;
  onAddToCart: (item: MenuItemWithCategory) => void;
}

export interface MenuItemCardProps {
  item: MenuItemWithCategory;
  onAddToCart: (item: MenuItemWithCategory) => void;
}

// Admin menu management types - re-export from queries for consistency
export type AdminMenuCategory = CategoryWithCount;
export type AdminMenuItem = QueryMenuItemWithCategory;

export interface CreateMenuCategoryData {
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateMenuCategoryData {
  name?: string
  description?: string
  isActive?: boolean
}

export interface CreateMenuItemData {
  name: string
  description?: string
  price: number
  image?: string
  isActive?: boolean
  isAvailable?: boolean
  categoryId: string
}

export interface UpdateMenuItemData {
  name?: string
  description?: string
  price?: number
  image?: string
  isActive?: boolean
  isAvailable?: boolean
  categoryId?: string
}

export interface ReorderItem {
  id: string
  order: number
}