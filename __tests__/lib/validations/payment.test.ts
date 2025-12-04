import { describe, it, expect } from '@jest/globals'
import { PaymentFormSchema } from '@/lib/validations/payment'
import { PaymentMethod } from '@prisma/client'

describe('Payment Validation Schema', () => {
  
  describe('PaymentFormSchema', () => {
    it('should validate CASH payment method', () => {
      const validData = {
        paymentMethod: PaymentMethod.CASH,
      }
      
      const result = PaymentFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.paymentMethod).toBe(PaymentMethod.CASH)
      }
    })

    it('should validate ONLINE payment method', () => {
      const validData = {
        paymentMethod: PaymentMethod.ONLINE,
      }
      
      const result = PaymentFormSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.paymentMethod).toBe(PaymentMethod.ONLINE)
      }
    })

    it('should reject invalid payment method', () => {
      const invalidData = {
        paymentMethod: 'CREDIT_CARD', // Not a valid enum value
      }
      
      const result = PaymentFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing payment method', () => {
      const invalidData = {}
      
      const result = PaymentFormSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should validate payment method enum values', () => {
      const cashData = { paymentMethod: 'CASH' }
      const onlineData = { paymentMethod: 'ONLINE' }
      
      expect(PaymentFormSchema.safeParse(cashData).success).toBe(true)
      expect(PaymentFormSchema.safeParse(onlineData).success).toBe(true)
    })
  })
})
