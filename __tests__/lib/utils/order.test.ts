import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  generateOrderNumber,
  formatOrderSummary,
} from '@/lib/utils/order'
import type { CartItem } from '@/types'
import { createMockCartItem } from '../../../jest.setup'

describe('Order Utilities - Comprehensive Tests', () => {
  
  describe('calculateSubtotal', () => {
    it('should calculate subtotal correctly for single item', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 100, quantity: 1 })
      ]
      expect(calculateSubtotal(items)).toBe(100)
    })

    it('should calculate subtotal correctly for multiple quantities', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 50, quantity: 3 })
      ]
      expect(calculateSubtotal(items)).toBe(150)
    })

    it('should calculate subtotal correctly for multiple different items', () => {
      const items: CartItem[] = [
        createMockCartItem({ menuItemId: 'item-1', price: 100, quantity: 2 }),
        createMockCartItem({ menuItemId: 'item-2', price: 50, quantity: 3 }),
        createMockCartItem({ menuItemId: 'item-3', price: 75, quantity: 1 }),
      ]
      // (100 * 2) + (50 * 3) + (75 * 1) = 200 + 150 + 75 = 425
      expect(calculateSubtotal(items)).toBe(425)
    })

    it('should return 0 for empty cart', () => {
      expect(calculateSubtotal([])).toBe(0)
    })

    it('should handle decimal prices correctly', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 99.99, quantity: 2 }),
        createMockCartItem({ menuItemId: 'item-2', price: 45.50, quantity: 3 })
      ]
      // (99.99 * 2) + (45.50 * 3) = 199.98 + 136.50 = 336.48
      expect(calculateSubtotal(items)).toBeCloseTo(336.48, 2)
    })

    it('should handle zero price items', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 0, quantity: 5 }),
        createMockCartItem({ menuItemId: 'item-2', price: 100, quantity: 1 })
      ]
      expect(calculateSubtotal(items)).toBe(100)
    })

    it('should handle large quantities', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 10, quantity: 100 })
      ]
      expect(calculateSubtotal(items)).toBe(1000)
    })

    it('should handle very small decimal prices', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 0.01, quantity: 100 })
      ]
      expect(calculateSubtotal(items)).toBeCloseTo(1, 2)
    })
  })

  describe('calculateTax', () => {
    it('should calculate 18% tax correctly by default', () => {
      expect(calculateTax(100)).toBeCloseTo(18, 2)
    })

    it('should calculate custom tax rate correctly', () => {
      expect(calculateTax(100, 5)).toBeCloseTo(5, 2)
    })

    it('should calculate 0% tax correctly', () => {
      const result = calculateTax(100, 0)
      expect(result).toBeCloseTo(0, 2)
    })

    it('should calculate tax for decimal subtotal', () => {
      expect(calculateTax(99.99, 18)).toBeCloseTo(17.9982, 2)
    })

    it('should handle zero subtotal', () => {
      expect(calculateTax(0, 18)).toBe(0)
    })

    it('should handle large subtotal amounts', () => {
      expect(calculateTax(10000, 18)).toBeCloseTo(1800, 2)
    })

    it('should calculate tax with high tax rate', () => {
      expect(calculateTax(100, 50)).toBeCloseTo(50, 2)
    })

    it('should calculate tax with decimal tax rate', () => {
      expect(calculateTax(100, 12.5)).toBeCloseTo(12.5, 2)
    })

    it('should handle undefined tax rate (default to 18%)', () => {
      expect(calculateTax(100, undefined)).toBeCloseTo(18, 2)
    })

    it('should handle negative subtotal gracefully', () => {
      // Testing edge case - though this shouldn't happen in production
      expect(calculateTax(-100, 18)).toBeCloseTo(-18, 2)
    })
  })

  describe('calculateTotal', () => {
    it('should calculate total with all components', () => {
      const subtotal = 100
      const tax = 18
      const deliveryCharge = 50
      expect(calculateTotal(subtotal, tax, deliveryCharge)).toBe(168)
    })

    it('should calculatetotal without delivery charge', () => {
      const subtotal = 100
      const tax = 18
      expect(calculateTotal(subtotal, tax)).toBe(118)
    })

    it('should calculate total with zero delivery charge', () => {
      const subtotal = 100
      const tax = 18
      const deliveryCharge = 0
      expect(calculateTotal(subtotal, tax, deliveryCharge)).toBe(118)
    })

    it('should handle decimal values correctly', () => {
      const subtotal = 99.99
      const tax = 17.9982
      const deliveryCharge = 49.50
      expect(calculateTotal(subtotal, tax, deliveryCharge)).toBeCloseTo(167.4882, 2)
    })

    it('should handle large amounts', () => {
      const subtotal = 10000
      const tax = 1800
      const deliveryCharge = 200
      expect(calculateTotal(subtotal, tax, deliveryCharge)).toBe(12000)
    })

    it('should handle all zero values', () => {
      expect(calculateTotal(0, 0, 0)).toBe(0)
    })

    it('should handle high delivery charges', () => {
      const subtotal = 100
      const tax = 18
      const deliveryCharge = 500
      expect(calculateTotal(subtotal, tax, deliveryCharge)).toBe(618)
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate order number with correct format', () => {
      const orderNumber = generateOrderNumber()
      // Format: ORD-{6 digit timestamp}{1-3 uppercase alphanumeric characters}
      expect(orderNumber).toMatch(/^ORD-\d{6}[A-Z0-9]{1,3}$/)
    })

    it('should generate unique order numbers', () => {
      const orderNumber1 = generateOrderNumber()
      const orderNumber2 = generateOrderNumber()
      expect(orderNumber1).not.toBe(orderNumber2)
    })

    it('should start with ORD- prefix', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber.startsWith('ORD-')).toBe(true)
    })

    it('should generate order number with correct length', () => {
      const orderNumber = generateOrderNumber()
      // ORD- (4) + 6 digits + 3 uppercase letters = 13 characters
      expect(orderNumber.length).toBe(13)
    })

    it('should generate multiple unique order numbers in sequence', () => {
      const orderNumbers = new Set()
      for (let i = 0; i < 10; i++) {
        orderNumbers.add(generateOrderNumber())
      }
      expect(orderNumbers.size).toBe(10)
    })
  })

  describe('formatOrderSummary', () => {
    it('should format order summary with all calculations', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 100, quantity: 2 }),
        createMockCartItem({ menuItemId: 'item-2', price: 50, quantity: 1 }),
      ]
      
      const summary = formatOrderSummary(items)
      
      expect(summary.subtotal).toBe(250) // (100 * 2) + (50 * 1)
      expect(summary.tax).toBeCloseTo(45, 2) // 250 * 0.18
      expect(summary.total).toBeCloseTo(295, 2) // 250 + 45
      expect(summary.itemCount).toBe(3) // 2 + 1
    })

    it('should format order summary for single item', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 100, quantity: 1 }),
      ]
      
      const summary = formatOrderSummary(items)
      
      expect(summary.subtotal).toBe(100)
      expect(summary.tax).toBeCloseTo(18, 2)
      expect(summary.total).toBeCloseTo(118, 2)
      expect(summary.itemCount).toBe(1)
    })

    it('should format order summary for empty cart', () => {
      const summary = formatOrderSummary([])
      
      expect(summary.subtotal).toBe(0)
      expect(summary.tax).toBe(0)
      expect(summary.total).toBe(0)
      expect(summary.itemCount).toBe(0)
    })

    it('should format order summary with multiple items of same type', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 75, quantity: 5 }),
      ]
      
      const summary = formatOrderSummary(items)
      
      expect(summary.subtotal).toBe(375) // 75 * 5
      expect(summary.tax).toBeCloseTo(67.5, 2) // 375 * 0.18
      expect(summary.total).toBeCloseTo(442.5, 2) // 375 + 67.5
      expect(summary.itemCount).toBe(5)
    })

    it('should format order summary with decimal prices', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 99.99, quantity: 2 }),
        createMockCartItem({ menuItemId: 'item-2', price: 49.99, quantity: 1 }),
      ]
      
      const summary = formatOrderSummary(items)
      
      expect(summary.subtotal).toBeCloseTo(249.97, 2)
      expect(summary.tax).toBeCloseTo(44.9946, 2)
      expect(summary.total).toBeCloseTo(294.9646, 2)
      expect(summary.itemCount).toBe(3)
    })

    it('should count items correctly for large quantity orders', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 10, quantity: 25 }),
        createMockCartItem({ menuItemId: 'item-2', price: 20, quantity: 15 }),
        createMockCartItem({ menuItemId: 'item-3', price: 5, quantity: 50 }),
      ]
      
      const summary = formatOrderSummary(items)
      
      expect(summary.itemCount).toBe(90) // 25 + 15 + 50
      expect(summary.subtotal).toBe(800) // (10*25) + (20*15) + (5*50)
    })

    it('should handle items with zero price', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 0, quantity: 5 }),
        createMockCartItem({ menuItemId: 'item-2', price: 100, quantity: 1 }),
      ]
      
      const summary = formatOrderSummary(items)
      
      expect(summary.subtotal).toBe(100)
      expect(summary.itemCount).toBe(6)
    })
  })

  describe('Edge Cases and Integration Tests', () => {
    it('should handle complete order flow with realistic data', () => {
      // Realistic cafe order scenario
      const items: CartItem[] = [
        createMockCartItem({ 
          menuItemId: 'coffee-1', 
          name: 'Cappuccino', 
          price: 150, 
          quantity: 2 
        }),
        createMockCartItem({ 
          menuItemId: 'sandwich-1', 
          name: 'Club Sandwich', 
          price: 250, 
          quantity: 1 
        }),
        createMockCartItem({ 
          menuItemId: 'pastry-1', 
          name: 'Croissant', 
          price: 80, 
          quantity: 3 
        }),
      ]

      const subtotal = calculateSubtotal(items)
      const tax = calculateTax(subtotal, 18)
      const deliveryCharge = 50
      const total = calculateTotal(subtotal, tax, deliveryCharge)

      expect(subtotal).toBe(790) // (150*2) + (250*1) + (80*3)
      expect(tax).toBeCloseTo(142.2, 2)
      expect(total).toBeCloseTo(982.2, 2)
    })

    it('should handle minimum order amount scenario', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 1, quantity: 1 })
      ]

      const summary = formatOrderSummary(items)
      expect(summary.subtotal).toBe(1)
      expect(summary.total).toBeCloseTo(1.18, 2)
    })

    it('should handle bulk order scenario', () => {
      const items: CartItem[] = [
        createMockCartItem({ price: 500, quantity: 50 })
      ]

      const summary = formatOrderSummary(items)
      expect(summary.subtotal).toBe(25000)
      expect(summary.tax).toBeCloseTo(4500, 2)
      expect(summary.total).toBeCloseTo(29500, 2)
      expect(summary.itemCount).toBe(50)
    })
  })
})
