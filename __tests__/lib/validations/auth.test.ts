import { loginSchema } from '@/lib/validations/auth'

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login credentials', () => {
      const validData = {
        email: 'admin@cafe.com',
        password: 'password123'
      }
      
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'password123'
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'admin@cafe.com',
        password: ''
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing email', () => {
      const invalidData = {
        password: 'password123'
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject missing password', () => {
      const invalidData = {
        email: 'admin@cafe.com'
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should handle SQL injection attempts safely', () => {
      const sqlInjectionData = {
        email: "admin@cafe.com' OR '1'='1",
        password: "' OR '1'='1"
      }
      
      // Schema should still validate format, SQL injection prevention happens at DB level
      const result = loginSchema.safeParse(sqlInjectionData)
      // Email format is invalid due to single quotes
      expect(result.success).toBe(false)
    })

    it('should accept various valid email formats', () => {
      const emails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com'
      ]

      emails.forEach(email => {
        const result = loginSchema.safeParse({
          email,
          password: 'password123'
        })
        expect(result.success).toBe(true)
      })
    })
  })
})

