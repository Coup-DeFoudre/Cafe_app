import { describe, it, expect } from '@jest/globals'
import { loginSchema } from '@/lib/validations/auth'

describe('Auth Validation Schema', () => {
  
  describe('loginSchema', () => {
    it('should validate correct email and password', () => {
      const validData = {
        email: 'admin@cafe.com',
        password: 'SecurePassword123',
      }
      
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('admin@cafe.com')
        expect(result.data.password).toBe('SecurePassword123')
      }
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email')
      }
    })

    it('should reject password that is too short', () => {
      const invalidData = {
        email: 'admin@cafe.com',
        password: '12345', // Less than 6 characters
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 6 characters')
      }
    })

    it('should reject empty fields', () => {
      const emptyEmail = {
        email: '',
        password: 'password123',
      }
      
      const emptyPassword = {
        email: 'admin@cafe.com',
        password: '',
      }
      
      expect(loginSchema.safeParse(emptyEmail).success).toBe(false)
      expect(loginSchema.safeParse(emptyPassword).success).toBe(false)
    })

    it('should handle potential SQL injection attempts', () => {
      const maliciousData = {
        email: "admin@cafe.com' OR '1'='1",
        password: "password' OR '1'='1",
      }
      
      // Schema should still validate structure (email format will fail)
      const result = loginSchema.safeParse(maliciousData)
      expect(result.success).toBe(false)
      
      // Valid email with long password (potential injection)
      const validStructure = {
        email: 'admin@cafe.com',
        password: "'; DROP TABLE users; --",
      }
      
      const result2 = loginSchema.safeParse(validStructure)
      // Should still validate (application layer handles SQL injection via prepared statements)
      expect(result2.success).toBe(true)
    })
  })
})
