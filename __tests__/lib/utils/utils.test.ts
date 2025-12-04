import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import {
  cn,
  formatCurrency,
  formatDate,
  generateOrderNumber,
  slugify,
  getRelativeTime,
} from '@/lib/utils'

describe('Utility Functions - Comprehensive Tests', () => {
  
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', { active: true, disabled: false })
      expect(result).toContain('base')
      expect(result).toContain('active')
      expect(result).not.toContain('disabled')
    })

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4')
      // twMerge should keep only px-4
      expect(result).toContain('px-4')
      expect(result).toContain('py-1')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
      expect(result).toContain('class3')
    })

    it('should handle undefined and null values', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle empty strings', () => {
      const result = cn('class1', '', 'class2')
      expect(result).toBe('class1 class2')
    })
  })

  describe('formatCurrency', () => {
    it('should format INR currency with default symbol', () => {
      const result = formatCurrency(100)
      expect(result).toBe('₹100.00')
    })

    it('should format INR currency with decimal values', () => {
      const result = formatCurrency(99.99)
      expect(result).toBe('₹99.99')
    })

    it('should format INR currency with custom symbol', () => {
      const result = formatCurrency(150, 'INR', 'Rs.')
      expect(result).toBe('Rs.150.00')
    })

    it('should format USD currency correctly', () => {
      const result = formatCurrency(100, 'USD')
      expect(result).toContain('100')
      expect(result).toContain('$')
    })

    it('should format EUR currency correctly', () => {
      const result = formatCurrency(100, 'EUR')
      expect(result).toContain('100')
      expect(result).toContain('€')
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(0)
      expect(result).toBe('₹0.00')
    })

    it('should handle large amounts', () => {
      const result = formatCurrency(1000000)
      expect(result).toBe('₹1000000.00')
    })

    it('should round to 2 decimal places', () => {
      const result = formatCurrency(99.999)
      expect(result).toBe('₹100.00')
    })

    it('should handle negative amounts', () => {
      const result = formatCurrency(-50)
      expect(result).toBe('₹-50.00')
    })

    it('should handle very small decimal amounts', () => {
      const result = formatCurrency(0.01)
      expect(result).toBe('₹0.01')
    })
  })

  describe('formatDate', () => {
    it('should format date with correct pattern', () => {
      const date = new Date('2024-01-15T10:30:00')
      const result = formatDate(date)
      
      // Should contain month, year
      expect(result).toContain('2024')
      expect(result).toContain('Jan')
      expect(result).toContain('15')
    })

    it('should include time in formatted output', () => {
      const date = new Date('2024-01-15T14:30:00')
      const result = formatDate(date)
      
      // Should contain time
      expect(result).toMatch(/\d{1,2}:\d{2}/)
    })

    it('should handle different months correctly', () => {
      const months = [
        { date: new Date('2024-01-01'), month: 'Jan' },
        { date: new Date('2024-02-01'), month: 'Feb' },
        { date: new Date('2024-12-01'), month: 'Dec' },
      ]

      months.forEach(({ date, month }) => {
        const result = formatDate(date)
        expect(result).toContain(month)
      })
    })

    it('should handle current date', () => {
      const now = new Date()
      const result = formatDate(now)
      expect(result).toBeTruthy()
      expect(result.length).toBeGreaterThan(10)
    })

    it('should handle past dates', () => {
      const pastDate = new Date('2020-05-10T08:00:00')
      const result = formatDate(pastDate)
      expect(result).toContain('2020')
      expect(result).toContain('May')
    })
  })

  describe('generateOrderNumber', () => {
    it('should generate order number with correct prefix', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber).toMatch(/^ORD-/)
    })

    it('should generate unique order numbers', () => {
      const orderNumber1 = generateOrderNumber()
      const orderNumber2 = generateOrderNumber()
      expect(orderNumber1).not.toBe(orderNumber2)
    })

    it('should generate uppercase order numbers', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber).toBe(orderNumber.toUpperCase())
    })

    it('should contain timestamp component', () => {
      const orderNumber = generateOrderNumber()
      // Should have ORD-{timestamp}-{random} format
      const parts = orderNumber.split('-')
      expect(parts).toHaveLength(3)
      expect(parts[0]).toBe('ORD')
    })

    it('should generate multiple unique order numbers', () => {
      const orderNumbers = new Set()
      for (let i = 0; i < 20; i++) {
        orderNumbers.add(generateOrderNumber())
      }
      expect(orderNumbers.size).toBe(20)
    })
  })

  describe('slugify', () => {
    it('should convert text to lowercase slug', () => {
      const result = slugify('Hello World')
      expect(result).toBe('hello-world')
    })

    it('should replace spaces with hyphens', () => {
      const result = slugify('My Awesome Cafe')
      expect(result).toBe('my-awesome-cafe')
    })

    it('should remove special characters', () => {
      const result = slugify('Hello@World!')
      expect(result).toBe('helloworld')
    })

    it('should handle multiple spaces', () => {
      const result = slugify('Hello    World')
      expect(result).toBe('hello-world')
    })

    it('should handle underscores', () => {
      const result = slugify('hello_world')
      expect(result).toBe('hello-world')
    })

    it('should trim leading and trailing spaces', () => {
      const result = slugify('  Hello World  ')
      expect(result).toBe('hello-world')
    })

    it('should remove leading and trailing hyphens', () => {
      const result = slugify('-Hello World-')
      expect(result).toBe('hello-world')
    })

    it('should handle unicode characters', () => {
      const result = slugify('Café & Restaurant')
      expect(result).toBe('caf-restaurant')
    })

    it('should handle numbers correctly', () => {
      const result = slugify('Cafe 123')
      expect(result).toBe('cafe-123')
    })

    it('should handle empty string', () => {
      const result = slugify('')
      expect(result).toBe('')
    })

    it('should handle string with only special characters', () => {
      const result = slugify('@#$%^&*()')
      expect(result).toBe('')
    })

    it('should consolidate consecutive hyphens', () => {
      const result = slugify('Hello---World')
      expect(result).toBe('hello-world')
    })
  })

  describe('getRelativeTime', () => {
    it('should return "Just now" for very recent dates', () => {
      const now = new Date()
      const recentDate = new Date(now.getTime() - 30 * 1000) // 30 seconds ago
      const result = getRelativeTime(recentDate)
      expect(result).toBe('Just now')
    })

    it('should return minutes for dates within an hour', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 15 * 60 * 1000) // 15 minutes ago
      const result = getRelativeTime(date)
      expect(result).toBe('15 min ago')
    })

    it('should return hours for dates within a day', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 3 * 60 * 60 * 1000) // 3 hours ago
      const result = getRelativeTime(date)
      expect(result).toBe('3 hr ago')
    })

    it('should return days for dates within a week', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      const result = getRelativeTime(date)
      expect(result).toBe('2 days ago')
    })

    it('should return formatted date for dates more than a week ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // 2 weeks ago
      const result = getRelativeTime(date)
      // Should return full formatted date (not relative)
      expect(result).toMatch(/\d{1,2}\s\w{3}\s\d{4}/)
    })

    it('should handle exactly 1 minute ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 60 * 1000) // 1 minute ago
      const result = getRelativeTime(date)
      expect(result).toBe('1 min ago')
    })

    it('should handle exactly 1 hour ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 60 * 60 * 1000) // 1 hour ago
      const result = getRelativeTime(date)
      expect(result).toBe('1 hr ago')
    })

    it('should handle exactly 1 day ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
      const result = getRelativeTime(date)
      expect(result).toBe('1 days ago')
    })

    it('should handle current time', () => {
      const now = new Date()
      const result = getRelativeTime(now)
      expect(result).toBe('Just now')
    })

    it('should handle 59 seconds ago as "Just now"', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 59 * 1000) // 59 seconds ago
      const result = getRelativeTime(date)
      expect(result).toBe('Just now')
    })
  })

  describe('Edge Cases and Integration', () => {
    it('should handle formatCurrency with slugify use case', () => {
      const price = formatCurrency(99.99)
      const slug = slugify('Cafe Special')
      
      expect(price).toBe('₹99.99')
      expect(slug).toBe('cafe-special')
    })

    it('should generate unique order number and format date together', () => {
      const orderNumber = generateOrderNumber()
      const orderDate = formatDate(new Date())
      
      expect(orderNumber).toMatch(/^ORD-/)
      expect(orderDate).toBeTruthy()
    })

    it('should handle all utilities in a complete order scenario', () => {
      const orderNumber = generateOrderNumber()
      const total = formatCurrency(1599.50)
      const orderDate = new Date()
      const formattedDate = formatDate(orderDate)
      const relativeTime = getRelativeTime(orderDate)
      const cafeSlug = slugify('My Awesome Cafe')
      const className = cn('order-card', { completed: true })

      expect(orderNumber).toMatch(/^ORD-/)
      expect(total).toBe('₹1599.50')
      expect(formattedDate).toBeTruthy()
      expect(relativeTime).toBe('Just now')
      expect(cafeSlug).toBe('my-awesome-cafe')
      expect(className).toContain('order-card')
      expect(className).toContain('completed')
    })
  })
})
