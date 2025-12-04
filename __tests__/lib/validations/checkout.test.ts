import { describe, it, expect } from '@jest/globals'
import { CheckoutFormSchema } from '@/lib/validations/checkout'
import { OrderType } from '@/types'
import { ZodError } from 'zod'

describe('Checkout Form Validation - Comprehensive Tests', () => {
  
  describe('Valid Scenarios - DINE_IN Orders', () => {
    it('should validate complete dine-in order with all fields', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '+919876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
        specialInstructions: 'No onions please',
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.customerName).toBe('John Doe')
        expect(result.data.tableNumber).toBe('10')
      }
    })

    it('should validate dine-in order without special instructions', () => {
      const validData = {
        customerName: 'Jane Smith',
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: 'A5',
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate dine-in with minimum name length', () => {
      const validData = {
        customerName: 'AB',
        customerPhone: '1234567890',
        orderType: OrderType.DINE_IN,
        tableNumber: '1',
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate dine-in with maximum name length', () => {
      const validData = {
        customerName: 'A'.repeat(50),
        customerPhone: '1234567890',
        orderType: OrderType.DINE_IN,
        tableNumber: '1',
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate different phone number formats', () => {
      const phoneNumbers = [
        '9876543210',
        '+919876543210',
        '+11234567890',
        '1234567890',
      ]

      phoneNumbers.forEach(phone => {
        const result = CheckoutFormSchema.safeParse({
          customerName: 'John Doe',
          customerPhone: phone,
          orderType: OrderType.DINE_IN,
          tableNumber: '10',
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Valid Scenarios - DELIVERY Orders', () => {
    const validDeliveryLocation = {
      lat: 12.9716,
      lng: 77.5946,
      mapLink: 'https://www.google.com/maps?q=12.9716,77.5946',
    }

    it('should validate complete delivery order', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '+919876543210',
        orderType: OrderType.DELIVERY,
        deliveryAddress: '123 Main St, Apt 4B, City, State 12345',
        deliveryLocation: validDeliveryLocation,
        specialInstructions: 'Ring the bell twice',
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.deliveryAddress).toBe('123 Main St, Apt 4B, City, State 12345')
      }
    })

    it('should validate delivery order with minimum address length', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DELIVERY,
        deliveryAddress: '1234567890', // Exactly 10 characters
        deliveryLocation: validDeliveryLocation,
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate delivery order with long address', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DELIVERY,
        deliveryAddress: '123 Main Street, Apartment 4B, Near Central Park, Downtown Area, City Name, State 12345',
        deliveryLocation: validDeliveryLocation,
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Invalid Scenarios - Customer Name', () => {
    it('should reject name with less than 2 characters', () => {
      const invalidData = {
        customerName: 'A',
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 2 characters')
      }
    })

    it('should reject name with more than 50 characters', () => {
      const invalidData = {
        customerName: 'A'.repeat(51),
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 50 characters')
      }
    })

    it('should reject empty name', () => {
      const invalidData = {
        customerName: '',
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing name', () => {
      const invalidData = {
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('Invalid Scenarios - Phone Number', () => {
    it('should reject phone number with less than 10 digits', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '987654321', // 9 digits
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid phone number')
      }
    })

    it('should reject phone number starting with 0', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '0987654321',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject phone number with letters', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '98765abcde',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject phone number with special characters', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '9876-543-210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty phone number', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing phone number', () => {
      const invalidData = {
        customerName: 'John Doe',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject phone number that is too long', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '+1234567890123456', // 16 digits (max is 15)
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('Invalid Scenarios - DINE_IN Specific', () => {
    it('should reject dine-in order without table number', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Table number is required')
      }
    })

    it('should reject dine-in order with empty table number', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Table number is required')
      }
    })
  })

  describe('Invalid Scenarios - DELIVERY Specific', () => {
    it('should reject delivery order without address', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DELIVERY,
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Delivery address is required')
      }
    })

    it('should reject delivery order with empty address', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DELIVERY,
        deliveryAddress: '',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject delivery order with address less than 10 characters', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DELIVERY,
        deliveryAddress: '123 Main', // 8 characters
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Delivery address is required')
      }
    })
  })

  describe('Invalid Scenarios - Special Instructions', () => {
    it('should reject special instructions exceeding 500 characters', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
        specialInstructions: 'A'.repeat(501),
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('less than 500 characters')
      }
    })

    it('should accept special instructions at exactly 500 characters', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
        specialInstructions: 'A'.repeat(500),
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept empty special instructions', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
        specialInstructions: '',
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Missing Required Fields', () => {
    it('should reject when order type is missing', () => {
      const invalidData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject when all  required fields are missing', () => {
      const invalidData = {}
      
      const result = CheckoutFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Edge Cases and Type Safety', () => {
    it('should handle numeric name gracefully', () => {
      const data = {
        customerName: 123 as any,
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should handle null values gracefully', () => {
      const data = {
        customerName: null as any,
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should handle undefined optional fields correctly', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '9876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
        deliveryAddress: undefined,
        specialInstructions: undefined,
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate complete real-world dine-in scenario', () => {
      const realWorldData = {
        customerName: 'Sarah Johnson',
        customerPhone: '+919876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: 'A12',
        specialInstructions: 'Extra napkins and cutlery for 4 people. Prefer window seat if available.',
      }
      
      const result = CheckoutFormSchema.safeParse(realWorldData)
      expect(result.success).toBe(true)
    })

    it('should validate complete real-world delivery scenario', () => {
      const realWorldData = {
        customerName: 'Michael Chen',
        customerPhone: '1234567890',
        orderType: OrderType.DELIVERY,
        deliveryAddress: '456 Oak Avenue, Apartment 3C, Near City Mall, Downtown District, Cityville 54321',
        deliveryLocation: {
          lat: 40.7128,
          lng: -74.0060,
          mapLink: 'https://www.google.com/maps?q=40.7128,-74.0060',
        },
        specialInstructions: 'Please call before delivery. Gate code is 1234. Leave at door if no answer.',
      }
      
      const result = CheckoutFormSchema.safeParse(realWorldData)
      expect(result.success).toBe(true)
    })
  })

  describe('International Phone Numbers', () => {
    it('should validate Indian phone number with country code', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '+919876543210',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate US phone number', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '+11234567890',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate UK phone number', () => {
      const validData = {
        customerName: 'John Doe',
        customerPhone: '+441234567890',
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
      }
      
      const result = CheckoutFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
