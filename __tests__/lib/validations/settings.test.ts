import { describe, it, expect } from '@jest/globals'
import {
  CafeInfoSchema,
  BusinessHoursSchema,
  SocialLinksSchema,
  ThemeColorsSchema,
  PaymentSettingsSchema,
  DeliverySettingsSchema,
  TaxSettingsSchema,
} from '@/lib/validations/settings'

describe('Settings Validation Schemas', () => {
  
  describe('CafeInfoSchema', () => {
    it('should validate correct cafe info', () => {
      const validData = {
        name: 'Sample Cafe',
        tagline: 'Best Coffee in Town',
        description: 'A cozy place for coffee lovers',
        phone: '+91 9876543210',
        email: 'info@samplecafe.com',
        address: '123 Main Street, City, State 12345',
      }
      
      const result = CafeInfoSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Sample Cafe')
      }
    })

    it('should reject cafe name that is too short', () => {
      const invalidData = {
        name: 'A', // Only 1 character
        tagline: 'Best Coffee',
        description: 'A cozy place',
        phone: '+91 9876543210',
        email: 'info@cafe.com',
        address: '123 Main Street',
      }
      
      const result = CafeInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 2 characters')
      }
    })

    it('should reject cafe name that is too long', () => {
      const invalidData = {
        name: 'A'.repeat(101), // 101 characters
        tagline: 'Best Coffee',
        description: 'A cozy place',
        phone: '+91 9876543210',
        email: 'info@cafe.com',
        address: '123 Main Street',
      }
      
      const result = CafeInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 100 characters')
      }
    })

    it('should validate email format', () => {
      const invalidData = {
        name: 'Sample Cafe',
        tagline: 'Best Coffee',
        description: 'A cozy place',
        phone: '+91 9876543210',
        email: 'invalid-email', // Invalid email
        address: '123 Main Street',
      }
      
      const result = CafeInfoSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email')
      }
    })

    it('should validate phone number format', () => {
      const validData = {
        name: 'Sample Cafe',
        tagline: 'Best Coffee',
        description: 'A cozy place',
        phone: '9876543210', // Valid 10 digit number
        email: 'info@cafe.com',
        address: '123 Main Street',
      }
      
      const result = CafeInfoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('BusinessHoursSchema', () => {
    it('should validate correct business hours for all days', () => {
      const validData = {
        monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
        sunday: { isOpen: false, openTime: '', closeTime: '' },
      }
      
      const result = BusinessHoursSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid time format', () => {
      const invalidData = {
        monday: { isOpen: true, openTime: '25:00', closeTime: '18:00' }, // Invalid hour
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
        sunday: { isOpen: false, openTime: '', closeTime: '' },
      }
      
      const result = BusinessHoursSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate closed day with empty times', () => {
      const validData = {
        monday: { isOpen: false, openTime: '', closeTime: '' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
        sunday: { isOpen: false, openTime: '', closeTime: '' },
      }
      
      const result = BusinessHoursSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should accept opening time before closing time', () => {
      const validData = {
        monday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
        sunday: { isOpen: false, openTime: '', closeTime: '' },
      }
      
      const result = BusinessHoursSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should handle midnight crossing times', () => {
      const validData = {
        monday: { isOpen: true, openTime: '20:00', closeTime: '02:00' }, // Crosses midnight
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
        saturday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
        sunday: { isOpen: false, openTime: '', closeTime: '' },
      }
      
      const result = BusinessHoursSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('SocialLinksSchema', () => {
    it('should validate correct social media URLs', () => {
      const validData = {
        facebook: 'https://facebook.com/samplecafe',
        instagram: 'https://instagram.com/samplecafe',
        twitter: 'https://twitter.com/samplecafe',
        whatsapp: 'https://wa.me/919876543210',
        website: 'https://samplecafe.com',
      }
      
      const result = SocialLinksSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL format', () => {
      const invalidData = {
        facebook: 'not-a-valid-url',
        instagram: 'https://instagram.com/samplecafe',
        twitter: 'https://twitter.com/samplecafe',
      }
      
      const result = SocialLinksSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should accept empty strings for optional links', () => {
      const validData = {
        facebook: '',
        instagram: 'https://instagram.com/samplecafe',
        twitter: '',
        whatsapp: '',
        website: '',
      }
      
      const result = SocialLinksSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('ThemeColorsSchema', () => {
    it('should validate correct hex color codes', () => {
      const validData = {
        primary: '#1e293b',
        secondary: '#64748b',
        accent: '#f59e0b',
      }
      
      const result = ThemeColorsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid hex color format', () => {
      const invalidData = {
        primary: 'blue', // Not hex format
        secondary: '#64748b',
        accent: '#f59e0b',
      }
      
      const result = ThemeColorsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject hex color without # prefix', () => {
      const invalidData = {
        primary: '1e293b', // Missing #
        secondary: '#64748b',
        accent: '#f59e0b',
      }
      
      const result = ThemeColorsSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('PaymentSettingsSchema', () => {
    it('should validate correct payment settings', () => {
      const validData = {
        onlinePaymentEnabled: true,
        paymentQrCode: 'https://example.com/qr-code.png',
        upiId: 'cafe@upi',
      }
      
      const result = PaymentSettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate UPI ID format', () => {
      const validData = {
        onlinePaymentEnabled: true,
        paymentQrCode: null,
        upiId: 'samplecafe@paytm',
      }
      
      const result = PaymentSettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('DeliverySettingsSchema', () => {
    it('should validate correct delivery settings', () => {
      const validData = {
        deliveryEnabled: true,
        deliveryCharge: 50,
        minOrderValue: 200,
      }
      
      const result = DeliverySettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate minimum order value', () => {
      const validData = {
        deliveryEnabled: true,
        deliveryCharge: 0, // Free delivery
        minOrderValue: 0, // No minimum
      }
      
      const result = DeliverySettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('TaxSettingsSchema', () => {
    it('should validate correct tax settings', () => {
      const validData = {
        taxEnabled: true,
        taxRate: 18, // 18% GST
      }
      
      const result = TaxSettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate zero tax rate', () => {
      const validData = {
        taxEnabled: false,
        taxRate: 0,
      }
      
      const result = TaxSettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate decimal tax rates', () => {
      const validData = {
        taxEnabled: true,
        taxRate: 12.5,
      }
      
      const result = TaxSettingsSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
