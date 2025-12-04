import { describe, it, expect } from '@jest/globals'
import {
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  generateOrderNumber,
  formatOrderSummary,
} from '@/lib/utils/order'
import type { CartItem } from '@/types'

describe('Order Flow Integration Tests', () => {
  
  describe('Complete Order Calculation Flow', () => {
    it('should calculate complete order from cart to total', () => {
      const cartItems: CartItem[] = [
        { menuItemId: '1', name: 'Coffee', price: 100, quantity: 2, isVeg: true },
        { menuItemId: '2', name: 'Sandwich', price: 150, quantity: 1, isVeg: true },
      ]

      const subtotal = calculateSubtotal(cartItems)
      const tax = calculateTax(subtotal, 18)
      const total = calculateTotal(subtotal, tax, 0)

      expect(subtotal).toBe(350) // (100*2) + (150*1)
      expect(tax).toBe(63) // 18% of 350
      expect(total).toBe(413) // 350 + 63
    })

    it('should handle order with delivery charge', () => {
      const cartItems: CartItem[] = [
        { menuItemId: '1', name: 'Pizza', price: 300, quantity: 1, isVeg: false },
      ]

      const subtotal = calculateSubtotal(cartItems)
      const tax = calculateTax(subtotal, 18)
      const deliveryCharge = 50
      const total = calculateTotal(subtotal, tax, deliveryCharge)

      expect(subtotal).toBe(300)
      expect(tax).toBe(54)
      expect(total).toBe(404) // 300 + 54 + 50
    })

    it('should handle multiple items with varying quantities', () => {
      const cartItems: CartItem[] = [
        { menuItemId: '1', name: 'Item1', price: 50, quantity: 3, isVeg: true },
        { menuItemId: '2', name: 'Item2', price: 75, quantity: 2, isVeg: true },
        { menuItemId: '3', name: 'Item3', price: 100, quantity: 1, isVeg: false },
      ]

      const subtotal = calculateSubtotal(cartItems)
      expect(subtotal).toBe(400) // (50*3) + (75*2) + (100*1)
    })
  })

  describe('Order Number Generation', () => {
    it('should generate unique order numbers', () => {
      const orderNum1 = generateOrderNumber()
      const orderNum2 = generateOrderNumber()

      expect(orderNum1).toBeDefined()
      expect(orderNum2).toBeDefined()
      expect(orderNum1).not.toBe(orderNum2)
    })

    it('should generate order numbers in correct format', () => {
      const orderNumber = generateOrderNumber()
      
      expect(orderNumber).toMatch(/^ORD-/)
      expect(orderNumber.length).toBeGreaterThan(4)
    })

    it('should generate multiple unique order numbers', () => {
      const numbers = Array.from({ length: 10 }, () => generateOrderNumber())
      const uniqueNumbers = new Set(numbers)
      
      expect(uniqueNumbers.size).toBe(10)
    })
  })

  describe('Order Summary Formatting', () => {
    it('should format complete order summary', () => {
      const items: CartItem[] = [
        { menuItemId: '1', name: 'Coffee', price: 100, quantity: 2, isVeg: true },
      ]

      const summary = formatOrderSummary(items)

      expect(summary).toBeDefined()
      expect(summary.subtotal).toBe(200)
      expect(summary.itemCount).toBe(2)
    })

    it('should include all cost breakdowns in summary', () => {
      const items: CartItem[] = [
        { menuItemId: '1', name: 'Item', price: 500, quantity: 1, isVeg: true },
      ]

      const summary = formatOrderSummary(items)

      expect(summary.subtotal).toBe(500)
      expect(summary.tax).toBeDefined()
      expect(summary.total).toBeDefined()
      expect(summary.itemCount).toBe(1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty cart', () => {
      const subtotal = calculateSubtotal([])
      const tax = calculateTax(subtotal, 18)
      const total = calculateTotal(subtotal, tax, 0)

      expect(subtotal).toBe(0)
      expect(tax).toBe(0)
      expect(total).toBe(0)
    })

    it('should handle zero tax rate', () => {
      const cartItems: CartItem[] = [
        { menuItemId: '1', name: 'Item', price: 100, quantity: 1, isVeg: true },
      ]

      const subtotal = calculateSubtotal(cartItems)
      const tax = calculateTax(subtotal, 0)
      const total = calculateTotal(subtotal, tax, 0)

      expect(tax).toBe(0)
      expect(total).toBe(100)
    })

    it('should handle large order values', () => {
      const cartItems: CartItem[] = [
        { menuItemId: '1', name: 'Expensive', price: 10000, quantity: 5, isVeg: true },
      ]

      const subtotal = calculateSubtotal(cartItems)
      const tax = calculateTax(subtotal, 18)
      const total = calculateTotal(subtotal, tax, 0)

      expect(subtotal).toBe(50000)
      expect(tax).toBe(9000)
      expect(total).toBe(59000)
    })

    it('should handle decimal prices correctly', () => {
      const cartItems: CartItem[] = [
        { menuItemId: '1', name: 'Item', price: 99.99, quantity: 2, isVeg: true },
      ]

      const subtotal = calculateSubtotal(cartItems)
      expect(subtotal).toBe(199.98)
    })
  })

  describe('Tax Calculations', () => {
    it('should calculate 5% tax correctly', () => {
      const tax = calculateTax(1000, 5)
      expect(tax).toBe(50)
    })

    it('should calculate 12% tax correctly', () => {
      const tax = calculateTax(1000, 12)
      expect(tax).toBe(120)
    })

    it('should calculate 18% tax correctly', () => {
      const tax = calculateTax(1000, 18)
      expect(tax).toBe(180)
    })

    it('should calculate 28% tax correctly', () => {
      const tax = calculateTax(1000, 28)
      expect(tax).toBe(280)
    })

    it('should handle fractional tax rates', () => {
      const tax = calculateTax(1000, 12.5)
      expect(tax).toBe(125)
    })
  })

  describe('Total Calculations', () => {
    it('should add subtotal and tax', () => {
      const total = calculateTotal(100, 18, 0)
      expect(total).toBe(118)
    })

    it('should add subtotal, tax, and delivery', () => {
      const total = calculateTotal(100, 18, 50)
      expect(total).toBe(168)
    })

    it('should handle zero delivery charge', () => {
      const total = calculateTotal(100, 18, 0)
      expect(total).toBe(118)
    })

    it('should handle negative delivery charge (discount)', () => {
      const total = calculateTotal(100, 18, -20)
      expect(total).toBe(98)
    })
  })

  describe('Cart Subtotal Calculations', () => {
    it('should sum single item', () => {
      const items: CartItem[] = [
        { menuItemId: '1', name: 'Item', price: 150, quantity: 2, isVeg: true },
      ]
      expect(calculateSubtotal(items)).toBe(300)
    })

    it('should sum multiple different items', () => {
      const items: CartItem[] = [
        { menuItemId: '1', name: 'Item1', price: 100, quantity: 1, isVeg: true },
        { menuItemId: '2', name: 'Item2', price: 200, quantity: 1, isVeg: true },
        { menuItemId: '3', name: 'Item3', price: 300, quantity: 1, isVeg: false },
      ]
      expect(calculateSubtotal(items)).toBe(600)
    })

    it('should handle items with quantity 0', () => {
      const items: CartItem[] = [
        { menuItemId: '1', name: 'Item', price: 100, quantity: 0, isVeg: true },
      ]
      expect(calculateSubtotal(items)).toBe(0)
    })

    it('should handle mixed quantities', () => {
      const items: CartItem[] = [
        { menuItemId: '1', name: 'Item1', price: 50, quantity: 5, isVeg: true },
        { menuItemId: '2', name: 'Item2', price: 100, quantity: 1, isVeg: true },
      ]
      expect(calculateSubtotal(items)).toBe(350)
    })
  })

  describe('Real-world Scenarios', () => {
    it('should calculate typical cafe order', () => {
      const items: CartItem[] = [
        { menuItemId: '1', name: 'Cappuccino', price: 120, quantity: 2, isVeg: true },
        { menuItemId: '2', name: 'Croissant', price: 80, quantity: 2, isVeg: true },
        { menuItemId: '3', name: 'Sandwich', price: 150, quantity: 1, isVeg: false },
      ]

      const subtotal = calculateSubtotal(items)
      const tax = calculateTax(subtotal, 5)
      const total = calculateTotal(subtotal, tax, 0)

      expect(subtotal).toBe(550)
      expect(tax).toBe(27.5)
      expect(total).toBe(577.5)
    })

    it('should calculate large group order', () => {
      const items: CartItem[] = Array.from({ length: 10 }, (_, i) => ({
        menuItemId: `item-${i}`,
        name: `Item ${i}`,
        price: 100,
        quantity: 2,
        isVeg: true,
      }))

      const subtotal = calculateSubtotal(items)
      expect(subtotal).toBe(2000)
    })

    it('should calculate delivery order with all charges', () => {
      const items: CartItem[] = [
        { menuItemId: '1', name: 'Pizza', price: 400, quantity: 2, isVeg: false },
        { menuItemId: '2', name: 'Coke', price: 50, quantity: 2, isVeg: true },
      ]

      const subtotal = calculateSubtotal(items)
      const tax = calculateTax(subtotal, 18)
      const deliveryCharge = 60
      const total = calculateTotal(subtotal, tax, deliveryCharge)

      expect(subtotal).toBe(900)
      expect(tax).toBe(162)
      expect(total).toBe(1122)
    })
  })
})
