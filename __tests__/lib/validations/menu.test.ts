import { MenuCategorySchema, MenuItemSchema, ReorderSchema } from '@/lib/validations/menu'

describe('Menu Validation Schemas', () => {
  describe('MenuCategorySchema', () => {
    it('should validate valid category data', () => {
      const validData = {
        name: 'Beverages',
        description: 'Hot and cold drinks',
        isActive: true
      }
      
      const result = MenuCategorySchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Beverages')
        expect(result.data.description).toBe('Hot and cold drinks')
        expect(result.data.isActive).toBe(true)
      }
    })

    it('should validate category with minimum name length', () => {
      const validData = { name: 'Ab' }
      const result = MenuCategorySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject category with name too short', () => {
      const invalidData = { name: 'A' }
      const result = MenuCategorySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject category with name too long', () => {
      const invalidData = { name: 'A'.repeat(51) }
      const result = MenuCategorySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject category with description too long', () => {
      const invalidData = {
        name: 'Beverages',
        description: 'A'.repeat(201)
      }
      const result = MenuCategorySchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should allow optional description', () => {
      const validData = { name: 'Beverages' }
      const result = MenuCategorySchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should default isActive to true', () => {
      const validData = { name: 'Beverages' }
      const result = MenuCategorySchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(true)
      }
    })
  })

  describe('MenuItemSchema', () => {
    const validCategoryId = 'clh12345678901234567890'

    it('should validate valid menu item data', () => {
      const validData = {
        categoryId: validCategoryId,
        name: 'Cappuccino',
        description: 'Italian coffee with steamed milk',
        price: 4.99,
        image: 'https://example.com/image.jpg',
        isAvailable: true,
        isVeg: true
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate menu item with empty string image', () => {
      const validData = {
        categoryId: validCategoryId,
        name: 'Cappuccino',
        price: 4.99,
        image: ''
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate menu item without image', () => {
      const validData = {
        categoryId: validCategoryId,
        name: 'Cappuccino',
        price: 4.99
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid image URL', () => {
      const invalidData = {
        categoryId: validCategoryId,
        name: 'Cappuccino',
        price: 4.99,
        image: 'not-a-url'
      }
      
      const result = MenuItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid categoryId format', () => {
      const invalidData = {
        categoryId: 'invalid-id',
        name: 'Cappuccino',
        price: 4.99
      }
      
      const result = MenuItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject name too short', () => {
      const invalidData = {
        categoryId: validCategoryId,
        name: 'A',
        price: 4.99
      }
      
      const result = MenuItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject name too long', () => {
      const invalidData = {
        categoryId: validCategoryId,
        name: 'A'.repeat(101),
        price: 4.99
      }
      
      const result = MenuItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative price', () => {
      const invalidData = {
        categoryId: validCategoryId,
        name: 'Cappuccino',
        price: -4.99
      }
      
      const result = MenuItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should allow zero price', () => {
      const validData = {
        categoryId: validCategoryId,
        name: 'Free Sample',
        price: 0
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject description too long', () => {
      const invalidData = {
        categoryId: validCategoryId,
        name: 'Cappuccino',
        price: 4.99,
        description: 'A'.repeat(501)
      }
      
      const result = MenuItemSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should default isAvailable to true', () => {
      const validData = {
        categoryId: validCategoryId,
        name: 'Cappuccino',
        price: 4.99
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isAvailable).toBe(true)
      }
    })

    it('should default isVeg to true', () => {
      const validData = {
        categoryId: validCategoryId,
        name: 'Cappuccino',
        price: 4.99
      }
      
      const result = MenuItemSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isVeg).toBe(true)
      }
    })
  })

  describe('ReorderSchema', () => {
    it('should validate valid reorder data', () => {
      const validData = {
        items: [
          { id: 'item1', order: 1 },
          { id: 'item2', order: 2 },
          { id: 'item3', order: 3 }
        ]
      }
      
      const result = ReorderSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty items array', () => {
      const invalidData = { items: [] }
      const result = ReorderSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject items without id', () => {
      const invalidData = {
        items: [{ order: 1 }]
      }
      const result = ReorderSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject items without order', () => {
      const invalidData = {
        items: [{ id: 'item1' }]
      }
      const result = ReorderSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate single item reorder', () => {
      const validData = {
        items: [{ id: 'item1', order: 0 }]
      }
      
      const result = ReorderSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})

