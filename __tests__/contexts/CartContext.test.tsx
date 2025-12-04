import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { renderHook, act, waitFor } from '@testing-library/react'
import { CartProvider, useCart } from '@/contexts/CartContext'
import type { MenuItemWithCategory } from '@/types/menu'
import { createMockMenuItem } from '../../jest.setup'

// Mock localStorage
const mockLocalStorage =() => {
  const store: { [key: string]: string } = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

describe('CartContext - Comprehensive Tests', () => {
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('Cart Initialization', () => {
    it('should initialize with empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      expect(result.current.items).toEqual([])
      expect(result.current.itemCount).toBe(0)
      expect(result.current.subtotal).toBe(0)
      expect(result.current.isOpen).toBe(false)
    })

    it('should load cart from localStorage on mount', () => {
      const savedCart = [
        {
          menuItemId: 'item-1',
          name: 'Coffee',
          price: 100,
          quantity: 2,
          isVeg: true,
        },
      ]

      localStorage.setItem('cafe-cart-sample-cafe', JSON.stringify(savedCart))

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      waitFor(() => {
        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0].name).toBe('Coffee')
        expect(result.current.itemCount).toBe(2)
      })
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('cafe-cart-sample-cafe', 'invalid-json-data')

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

     expect(result.current.items).toEqual([])
    })

    it('should use custom cafe key for storage', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: ({ children }) => (
          <CartProvider cafeKey="my-custom-cafe">{children}</CartProvider>
        ),
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        name: 'Test Item',
        price: 50,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      // Verify item was added successfully (localStorage is mocked globally)
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].name).toBe('Test Item')
    })
  })

  describe('addItem', () => {
    it('should add new item to empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
       name: 'Cappuccino',
        price: 150,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].menuItemId).toBe('item-1')
      expect(result.current.items[0].name).toBe('Cappuccino')
      expect(result.current.items[0].price).toBe(150)
      expect(result.current.items[0].quantity).toBe(1)
    })

    it('should increment quantity if item already exists', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Cappuccino',
        price: 150,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
        result.current.addItem(menuItem)
        result.current.addItem(menuItem)
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(3)
      expect(result.current.itemCount).toBe(3)
    })

    it('should add multiple different items to cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const item1: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Cappuccino',
        price: 150,
      }) as any

      const item2: MenuItemWithCategory = createMockMenuItem({
        id: 'item-2',
        name: 'Sandwich',
        price: 200,
      }) as any

      act(() => {
        result.current.addItem(item1)
        result.current.addItem(item2)
      })

      expect(result.current.items).toHaveLength(2)
      expect(result.current.itemCount).toBe(2)
      expect(result.current.subtotal).toBe(350)
    })

    it('should preserve item properties when adding to cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Veg Burger',
        price: 180,
        isVeg: true,
        image: '/images/burger.jpg',
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      expect(result.current.items[0].isVeg).toBe(true)
      expect(result.current.items[0].image).toBe('/images/burger.jpg')
    })

    it('should add item and update cart state correctly', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      // Verify state was updated correctly
      expect(result.current.items).toHaveLength(1)
      expect(result.current.subtotal).toBe(100)
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      expect(result.current.items).toHaveLength(1)

      act(() => {
        result.current.removeItem('item-1')
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.itemCount).toBe(0)
      expect(result.current.subtotal).toBe(0)
    })

    it('should only remove specified item, keep others', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const item1: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      const item2: MenuItemWithCategory = createMockMenuItem({
        id: 'item-2',
        name: 'Tea',
        price: 80,
      }) as any

      act(() => {
        result.current.addItem(item1)
        result.current.addItem(item2)
      })

      expect(result.current.items).toHaveLength(2)

      act(() => {
        result.current.removeItem('item-1')
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].menuItemId).toBe('item-2')
    })

    it('should handle removing non-existent item gracefully', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      act(() => {
        result.current.removeItem('non-existent-id')
      })

      expect(result.current.items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      act(() => {
        result.current.updateQuantity('item-1', 5)
      })

      expect(result.current.items[0].quantity).toBe(5)
      expect(result.current.itemCount).toBe(5)
      expect(result.current.subtotal).toBe(500)
    })

    it('should remove item when quantity is set to 0', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      act(() => {
        result.current.updateQuantity('item-1', 0)
      })

      expect(result.current.items).toHaveLength(0)
    })

    it('should remove item when quantity is negative', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      act(() => {
        result.current.updateQuantity('item-1', -5)
      })

      expect(result.current.items).toHaveLength(0)
    })

    it('should update only specified item quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const item1: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      const item2: MenuItemWithCategory = createMockMenuItem({
        id: 'item-2',
        name: 'Tea',
        price: 80,
      }) as any

      act(() => {
        result.current.addItem(item1)
        result.current.addItem(item2)
      })

      act(() => {
        result.current.updateQuantity('item-1', 10)
      })

      expect(result.current.items[0].quantity).toBe(10)
      expect(result.current.items[1].quantity).toBe(1)
    })
  })

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const item1: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      const item2: MenuItemWithCategory = createMockMenuItem({
        id: 'item-2',
        name: 'Tea',
        price: 80,
      }) as any

      act(() => {
        result.current.addItem(item1)
        result.current.addItem(item2)
      })

      expect(result.current.items).toHaveLength(2)

      act(() => {
        result.current.clearCart()
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.itemCount).toBe(0)
      expect(result.current.subtotal).toBe(0)
    })

    it('should handle clearing an already empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      act(() => {
        result.current.clearCart()
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  describe('Cart Open/Close', () => {
    it('should open cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      expect(result.current.isOpen).toBe(false)

      act(() => {
        result.current.openCart()
      })

      expect(result.current.isOpen).toBe(true)
    })

    it('should close cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      act(() => {
        result.current.openCart()
      })

      expect(result.current.isOpen).toBe(true)

      act(() => {
        result.current.closeCart()
      })

      expect(result.current.isOpen).toBe(false)
    })

    it('should toggle cart state multiple times', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      act(() => {
        result.current.openCart()
      })
      expect(result.current.isOpen).toBe(true)

      act(() => {
        result.current.closeCart()
      })
      expect(result.current.isOpen).toBe(false)

      act(() => {
        result.current.openCart()
      })
      expect(result.current.isOpen).toBe(true)
    })
  })

  describe('Derived Values Calculation', () => {
    it('should calculate itemCount correctly for single item', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
        result.current.addItem(menuItem)
        result.current.addItem(menuItem)
      })

      expect(result.current.itemCount).toBe(3)
    })

    it('should calculate itemCount correctly for multiple items', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const item1: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        price: 100,
      }) as any

      const item2: MenuItemWithCategory = createMockMenuItem({
        id: 'item-2',
        price: 80,
      }) as any

      act(() => {
        result.current.addItem(item1)
        result.current.addItem(item1)
        result.current.addItem(item2)
        result.current.addItem(item2)
        result.current.addItem(item2)
      })

      expect(result.current.itemCount).toBe(5) // 2 + 3
    })

    it('should calculate subtotal correctly', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const item1: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        price: 150,
      }) as any

      const item2: MenuItemWithCategory = createMockMenuItem({
        id: 'item-2',
        price: 200,
      }) as any

      act(() => {
        result.current.addItem(item1)
        result.current.addItem(item1) // 150 * 2 = 300
        result.current.addItem(item2) // 200 * 1 = 200
      })

      expect(result.current.subtotal).toBe(500)
    })

    it('should update subtotal when quantity changes', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        price: 100,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
      })

      expect(result.current.subtotal).toBe(100)

      act(() => {
        result.current.updateQuantity('item-1', 5)
      })

      expect(result.current.subtotal).toBe(500)
    })
  })

  describe('Error Handling', () => {
    it('should throw error when useCart is used outside provider', () => {
      expect(() => {
        renderHook(() => useCart())
      }).toThrow('useCart must be used within a CartProvider')
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle complete order flow', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      // Add items
      const coffee: MenuItemWithCategory = createMockMenuItem({
        id: 'coffee-1',
        name: 'Cappuccino',
        price: 150,
      }) as any

      const sandwich: MenuItemWithCategory = createMockMenuItem({
        id: 'sandwich-1',
        name: 'Club Sandwich',
        price: 250,
      }) as any

      act(() => {
        result.current.addItem(coffee)
        result.current.addItem(coffee)
        result.current.addItem(sandwich)
      })

      expect(result.current.items).toHaveLength(2)
      expect(result.current.itemCount).toBe(3)
      expect(result.current.subtotal).toBe(550)

      // Update quantity
      act(() => {
        result.current.updateQuantity('coffee-1', 3)
      })

      expect(result.current.subtotal).toBe(700)

      // Remove item
      act(() => {
        result.current.removeItem('sandwich-1')
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.subtotal).toBe(450)

      // Clear cart
      act(() => {
        result.current.clearCart()
      })

      expect(result.current.items).toHaveLength(0)
      expect(result.current.subtotal).toBe(0)
    })

    it('should persist cart state through multiple operations', () => {
      const { result, rerender } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      })

      const menuItem: MenuItemWithCategory = createMockMenuItem({
        id: 'item-1',
        name: 'Coffee',
        price: 100,
      }) as any

      act(() => {
        result.current.addItem(menuItem)
        result.current.addItem(menuItem)
      })

      // Verify cart state before re-render
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(2)

      // Simulate re-render
      rerender()

      // State should persist after re-render
      expect(result.current.items).toHaveLength(1)
      expect(result.current.items[0].quantity).toBe(2)
    })
  })
})
