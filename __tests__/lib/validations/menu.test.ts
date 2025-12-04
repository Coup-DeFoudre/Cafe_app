import { describe, it, expect } from '@jest/globals'
import {
  MenuCategorySchema,
  MenuItemSchema,
  ReorderSchema,
} from '@/lib/validations/menu'

describe('Menu Validation Schemas', () => {
  
  describe('MenuCategorySchema', () => {
    it('should validate correct category data', () => {
      const validData = {
        name: 'Beverages',
        description: 'Hot and cold drinks',
        isActive: true,
      }
      
      const result = MenuCategorySchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Beverages')
        expect(result.data.isActive).toBe(true)
      }
    })

    it('should reject category name that is too short', () => {
      const invalidData = {
        name: 'A', // Only 1 character
        description: 'Test category',
        isActive: true,
      }
      
      const result = MenuCategorySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters')
      }
    })

    it('should reject category name that is too long', () => {
      const invalidData = {
        name: 'A'.repeat(51), // 51 characters
        description: 'Test category',
        isActive: true,
      }
      
      const result = MenuCategorySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 50 characters')
      }
    })

    it('should validate optional description field', () => {
      const validData = {
        name: 'Beverages',
        description: undefined,
        isActive: true,
      }
      
      const result = MenuCategorySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate isActive boolean field', () => {
      const validData = {
        name: 'Snacks',
        description: 'Quick bites',
        isActive: false,
      }
      
      const result = MenuCategorySchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(false)
      }
    })
  })

  describe('MenuItemSchema', () => {
    it('should validate correct menu item data', () => {
      const validData = {
        categoryId: 'clx1234567890',
        name: 'Cappuccino',
        description: 'Classic Italian coffee with steamed milk',
        price: 150,
        image: 'https://example.com/cappuccino.jpg',
        isVeg: true,
        isAvailable: true,
        customizations: null,
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Cappuccino')
        expect(result.data.price).toBe(150)
      }
    })

    it('should reject invalid categoryId format', () => {
      const invalidData = {
        categoryId: 'invalid-id', // Not a CUID
        name: 'Test Item',
        description: 'Test',
        price: 100,
        isVeg: true,
        isAvailable: true,
      }
      
      const result = MenuItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid category ID')
      }
    })

    it('should reject negative price', () => {
      const invalidData = {
        categoryId: 'clx1234567890',
        name: 'Test Item',
        description: 'Test',
        price: -10, // Negative price
        isVeg: true,
        isAvailable: true,
      }
      
      const result = MenuItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('greater than or equal to 0')
      }
    })

    it('should validate zero price', () => {
      const validData = {
        categoryId: 'clx1234567890',
        name: 'Free Sample',
        description: 'Complimentary item',
        price: 0,
        isVeg: true,
        isAvailable: true,
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate decimal price', () => {
      const validData = {
        categoryId: 'clx1234567890',
        name: 'Coffee',
        description: 'Fresh brewed coffee',
        price: 149.99,
        isVeg: true,
        isAvailable: true,
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.price).toBe(149.99)
      }
    })

    it('should validate image URL', () => {
      const validData = {
        categoryId: 'clx1234567890',
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 299,
        image: 'https://cloudinary.com/image.jpg',
        isVeg: false,
        isAvailable: true,
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate isVeg boolean', () => {
      const vegData = {
        categoryId: 'clx1234567890',
        name: 'Salad',
        description: 'Fresh salad',
        price: 150,
        isVeg: true,
        isAvailable: true,
      }
      
      const nonVegData = {
        categoryId: 'clx1234567890',
        name: 'Chicken Burger',
        description: 'Grilled chicken burger',
        price: 250,
        isVeg: false,
        isAvailable: true,
      }
      
      expect(MenuItemSchema.safeParse(vegData).success).toBe(true)
      expect(MenuItemSchema.safeParse(nonVegData).success).toBe(true)
    })

    it('should validate isAvailable boolean', () => {
      const availableData = {
        categoryId: 'clx1234567890',
        name: 'Coffee',
        description: 'Available now',
        price: 100,
        isVeg: true,
        isAvailable: true,
      }
      
      const unavailableData = {
        categoryId: 'clx1234567890',
        name: 'Special Dish',
        description: 'Out of stock',
        price: 300,
        isVeg: true,
        isAvailable: false,
      }
      
      expect(MenuItemSchema.safeParse(availableData).success).toBe(true)
      expect(MenuItemSchema.safeParse(unavailableData).success).toBe(true)
    })

    it('should validate customizations JSON field', () => {
      const validData = {
        categoryId: 'clx1234567890',
        name: 'Coffee',
        description: 'Customizable coffee',
        price: 100,
        isVeg: true,
        isAvailable: true,
        customizations: {
          size: ['Small', 'Medium', 'Large'],
          sugar: ['No Sugar', 'Less Sugar', 'Regular'],
        },
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('ReorderSchema', () => {
    it('should validate correct reorder array', () => {
      const validData = {
        items: [
          { id: 'clx1234567890', order: 0 },
          { id: 'clx0987654321', order: 1 },
          { id: 'clx1122334455', order: 2 },
        ],
      }
      
      const result = ReorderSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.items).toHaveLength(3)
      }
    })

    it('should reject empty reorder array', () => {
      const invalidData = {
        items: [],
      }
      
      const result = ReorderSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 1')
      }
    })

    it('should reject invalid item structure', () => {
      const invalidData = {
        items: [
          { id: 'invalid-id', order: 0 }, // Invalid CUID
        ],
      }
      
      const result = ReorderSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate large reorder array', () => {
      const items = Array.from({ length: 50 }, (_, i) => ({
        id: `clx${i.toString().padStart(10, '0')}`,
        order: i,
      }))
      
      const validData = { items }
      const result = ReorderSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.items).toHaveLength(50)
      }
    })

    it('should validate order field with negative numbers', () => {
      const validData = {
        items: [
          { id: 'clx1234567890', order: -1 },
          { id: 'clx0987654321', order: 0 },
        ],
      }
      
      const result = ReorderSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
