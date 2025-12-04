'use client';

import { useRef } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import Header from './Header';
import HeroSection from './HeroSection';
import CategoryCards from './CategoryCards';
import TodaysSpecial from './TodaysSpecial';
import AboutQuickOrder from './AboutQuickOrder';
import MenuBrowser, { MenuBrowserRef } from './MenuBrowser';
import FooterSection from './FooterSection';
import type { MenuItemWithCategory } from '@/types/menu';

interface HomePageClientProps {
  cafe: {
    id?: string;
    name: string;
    tagline?: string | null;
    description?: string | null;
    logo?: string | null;
    bannerImage?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    businessHours?: any;
    socialLinks?: any;
    themeColors?: any;
  };
  categories: any[];
  items: MenuItemWithCategory[];
}

export default function HomePageClient({ cafe, categories, items }: HomePageClientProps) {
  const { addItem } = useCart();
  const menuBrowserRef = useRef<MenuBrowserRef>(null);

  const handleCategoryClick = (categoryId: string) => {
    // First scroll to menu section
    const menuSection = document.getElementById('menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Then set the category filter after a short delay to allow scroll to complete
    setTimeout(() => {
      if (menuBrowserRef.current) {
        menuBrowserRef.current.setCategory(categoryId);
      }
    }, 300);
  };

  const handleAddToCart = (item: MenuItemWithCategory) => {
    addItem(item);
    toast.success("Item added to cart", {
      description: `${item.name} has been added to your cart.`,
    });
  };

  // Prepare categories for display (with item count)
  const categoriesForDisplay = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    itemCount: cat.itemCount || cat.menuItems?.length || 0,
  }));

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <Header cafeName={cafe.name} />

      {/* Hero Section */}
      <HeroSection cafe={cafe} />

      {/* Category Cards */}
      <CategoryCards 
        categories={categoriesForDisplay}
        onCategoryClick={handleCategoryClick} 
      />

      {/* Today's Special */}
      <TodaysSpecial 
        items={items} 
        onAddToCart={handleAddToCart} 
      />

      {/* About & Quick Order */}
      <AboutQuickOrder 
        cafeName={cafe.name}
        description={cafe.description}
        categories={categoriesForDisplay}
        onCategoryClick={handleCategoryClick}
      />

      {/* Menu Section */}
      <section id="menu" className="py-12 bg-[#FAF7F2]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-3">Our Menu</h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              Discover our carefully crafted selection of beverages and snacks, 
              made with the finest ingredients.
            </p>
          </div>

          <MenuBrowser 
            ref={menuBrowserRef}
            categories={categories} 
            items={items} 
          />
        </div>
      </section>

      {/* Footer Section */}
      <FooterSection cafe={cafe} />
    </div>
  );
}
