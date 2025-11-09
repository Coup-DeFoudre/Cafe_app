'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import type { CartItem } from '@/types';
import type { MenuItemWithCategory } from '@/types/menu';
import { DEFAULT_CAFE_SLUG } from '@/lib/constants';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: MenuItemWithCategory) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  cafeKey?: string;
}

export function CartProvider({ children, cafeKey }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Generate storage key dynamically
  const storageKey = `cafe-cart-${cafeKey || DEFAULT_CAFE_SLUG}`;

  // Calculate derived values
  const itemCount = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, [storageKey]);

  // Sync cart state with localStorage on changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = (item: MenuItemWithCategory) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(cartItem => cartItem.menuItemId === item.id);
      
      if (existingItem) {
        // Increment quantity if item already exists
        return currentItems.map(cartItem =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Add new item to cart
        const newCartItem: CartItem = {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image || undefined,
          isVeg: item.isVeg,
          customizations: undefined,
        };
        return [...currentItems, newCartItem];
      }
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => {
    setIsOpen(true);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  const value: CartContextType = {
    items,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isOpen,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}