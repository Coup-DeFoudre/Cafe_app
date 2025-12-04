import { describe, it, expect } from '@jest/globals'
import {
  cn,
  formatCurrency,
  formatDate,
  slugify,
  getRelativeTime,
} from '@/lib/utils'

describe('Extended Utility Functions - Edge Cases', () => {
  
  describe('cn - Advanced Scenarios', () => {
    it('should handle deep nested conditionals', () => {
      const result = cn(
        'base',
        {
          'active': true,
          'disabled': false,
          'loading': true,
          'error': false
        }
      )
      expect(result).toContain('base')
      expect(result).toContain('active')
      expect(result).toContain('loading')
      expect(result).not.toContain('disabled')
      expect(result).not.toContain('error')
    })

    it('should handle multiple Tailwind variants', () => {
      const result = cn('hover:bg-blue-500', 'focus:bg-blue-600', 'active:bg-blue-700')
      expect(result).toContain('hover:bg-blue-500')
      expect(result).toContain('focus:bg-blue-600')
      expect(result).toContain('active:bg-blue-700')
    })

    it('should merge responsive classes correctly', () => {
      const result = cn('text-sm md:text-base lg:text-lg')
      expect(result).toContain('text-sm')
      expect(result).toContain('md:text-base')
      expect(result).toContain('lg:text-lg')
    })

    it('should handle dark mode variants', () => {
      const result = cn('bg-white dark:bg-gray-900')
      expect(result).toContain('bg-white')
      expect(result).toContain('dark:bg-gray-900')
    })

    it('should merge spacing classes with conflicts', () => {
      const result = cn('p-4', 'px-8')
      expect(result).toContain('px-8')
      expect(result).toContain('p-4')
    })
  })

  describe('formatCurrency - Edge Cases', () => {
    it('should handle very large numbers', () => {
      const result = formatCurrency(999999999.99)
      expect(result).toBe('₹999999999.99')
    })

    it('should handle very small decimal amounts', () => {
      const result = formatCurrency(0.001)
      expect(result).toBe('₹0.00')
    })

    it('should handle negative zero', () => {
      const result = formatCurrency(-0)
      expect(result).toBe('₹0.00')
    })

    it('should handle Infinity gracefully', () => {
      const result = formatCurrency(Infinity)
      expect(result).toContain('Infinity')
    })

    it('should handle NaN gracefully', () => {
      const result = formatCurrency(NaN)
      expect(result).toContain('NaN')
    })

    it('should format with different precision', () => {
      const result = formatCurrency(100.123456)
      expect(result).toBe('₹100.12')
    })

    it('should handle scientific notation numbers', () => {
      const result = formatCurrency(1e6)
      expect(result).toBe('₹1000000.00')
    })

    it('should handle custom symbol with spaces', () => {
      const result = formatCurrency(100, 'INR', 'Rs. ')
      expect(result).toBe('Rs. 100.00')
    })
  })

  describe('formatDate - Extended Cases', () => {
    it('should handle dates from different years', () => {
      const date1 = new Date('2020-01-01')
      const date2 = new Date('2030-12-31')
      
      expect(formatDate(date1)).toContain('2020')
      expect(formatDate(date2)).toContain('2030')
    })

    it('should handle leap year dates', () => {
      const leapDay = new Date('2024-02-29T12:00:00')
      const result = formatDate(leapDay)
      expect(result).toBeTruthy()
      expect(result).toContain('Feb')
      expect(result).toContain('29')
    })

    it('should handle year boundaries', () => {
      const newYear = new Date('2024-01-01T00:00:00')
      const result = formatDate(newYear)
      expect(result).toContain('2024')
      expect(result).toContain('Jan')
    })

    it('should handle different time zones conceptually', () => {
      const utcDate = new Date('2024-01-15T12:00:00Z')
      const result = formatDate(utcDate)
      expect(result).toBeTruthy()
      expect(result.length).toBeGreaterThan(10)
    })

    it('should handle very old dates', () => {
      const oldDate = new Date('1900-01-01')
      const result = formatDate(oldDate)
      expect(result).toContain('1900')
    })

    it('should handle future dates far ahead', () => {
      const futureDate = new Date('2100-12-25')
      const result = formatDate(futureDate)
      expect(result).toContain('2100')
    })
  })

  describe('slugify - Complex Scenarios', () => {
    it('should handle consecutive special characters', () => {
      const result = slugify('hello@@@world')
      expect(result).toBe('helloworld')
    })

    it('should handle mixed case with numbers', () => {
      const result = slugify('Product-123-ABC')
      expect(result).toBe('product-123-abc')
    })

    it('should handle parentheses and brackets', () => {
      const result = slugify('Item (Large) [Premium]')
      expect(result).toBe('item-large-premium')
    })

    it('should handle quotes and apostrophes', () => {
      const result = slugify("Mike's \"Special\" Cafe")
      expect(result).toBe('mikes-special-cafe')
    })

    it('should handle ampersand correctly', () => {
      const result = slugify('Coffee & Tea Shop')
      expect(result).toBe('coffee-tea-shop')
    })

    it('should handle very long strings', () => {
      const longString = 'A'.repeat(200)
      const result = slugify(longString)
      expect(result).toBe('a'.repeat(200))
    })

    it('should handle currency symbols', () => {
      const result = slugify('$100 Dollar Menu €50')
      expect(result).toBe('100-dollar-menu-50')
    })

    it('should handle percentage signs', () => {
      const result = slugify('50% Off Sale')
      expect(result).toBe('50-off-sale')
    })

    it('should handle forward slashes', () => {
      const result = slugify('Coffee/Tea/Beverages')
      expect(result).toBe('coffeeteabeverages')
    })

    it('should handle plus signs', () => {
      const result = slugify('Combo+Meal+Deal')
      expect(result).toBe('combomealdeal')
    })
  })

  describe('getRelativeTime - Comprehensive Cases', () => {
    it('should handle exact minute boundaries', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 5 * 60 * 1000)
      expect(getRelativeTime(date)).toBe('5 min ago')
    })

    it('should handle 30 minutes ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 30 * 60 * 1000)
      expect(getRelativeTime(date)).toBe('30 min ago')
    })

    it('should handle 2 hours ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 2 * 60 * 60 * 1000)
      expect(getRelativeTime(date)).toBe('2 hr ago')
    })

    it('should handle 12 hours ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 12 * 60 * 60 * 1000)
      expect(getRelativeTime(date)).toBe('12 hr ago')
    })

    it('should handle 3 days ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      expect(getRelativeTime(date)).toBe('3 days ago')
    })

    it('should handle 6 days ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000)
      expect(getRelativeTime(date)).toBe('6 days ago')
    })

    it('should handle exactly 7 days ago (week boundary)', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const result = getRelativeTime(date)
      expect(result).toMatch(/\d{1,2}\s\w{3}\s\d{4}/)
    })

    it('should handle 30 days ago', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const result = getRelativeTime(date)
      expect(result).toMatch(/\d{1,2}\s\w{3}\s\d{4}/)
    })

    it('should handle dates from last year', () => {
      const lastYear = new Date()
      lastYear.setFullYear(lastYear.getFullYear() - 1)
      const result = getRelativeTime(lastYear)
      expect(result).toMatch(/\d{1,2}\s\w{3}\s\d{4}/)
    })

    it('should handle 45 seconds ago (should be just now)', () => {
      const now = new Date()
      const date = new Date(now.getTime() - 45 * 1000)
      expect(getRelativeTime(date)).toBe('Just now')
    })
  })

  describe('Combination & Integration Tests', () => {
    it('should format currency and use in class names', () => {
      const price = 99.99
      const formattedPrice = formatCurrency(price)
      const className = cn('price', { expensive: price > 50 })
      
      expect(formattedPrice).toBe('₹99.99')
      expect(className).toContain('expensive')
    })

    it('should create slug and format date for same item', () => {
      const itemName = 'Special Coffee Item'
      const createdAt = new Date('2024-01-15')
      
      const slug = slugify(itemName)
      const dateStr = formatDate(createdAt)
      
      expect(slug).toBe('special-coffee-item')
      expect(dateStr).toContain('Jan')
      expect(dateStr).toContain('2024')
    })

    it('should handle complete product display scenario', () => {
      const product = {
        name: 'Premium Coffee (Large)',
        price: 150.50,
        createdAt: new Date('2024-01-01T10:00:00Z')
      }
      
      const slug = slugify(product.name)
      const price = formatCurrency(product.price)
      const date = formatDate(product.createdAt)
      const timeAgo = getRelativeTime(product.createdAt)
      
      expect(slug).toBe('premium-coffee-large')
      expect(price).toBe('₹150.50')
      expect(date).toBeTruthy()
      expect(timeAgo).toBeTruthy()
    })

    it('should handle order summary formatting', () => {
      const orderData = {
        orderNumber: 'ORD-12345',
        total: 599.99,
        orderDate: new Date(),
        status: 'pending'
      }
      
      const total = formatCurrency(orderData.total)
      const timeAgo = getRelativeTime(orderData.orderDate)
      const statusClass = cn('badge', { 
        'badge-warning': orderData.status === 'pending',
        'badge-success': orderData.status === 'completed'
      })
      
      expect(total).toBe('₹599.99')
      expect(timeAgo).toBe('Just now')
      expect(statusClass).toContain('badge-warning')
    })
  })

  describe('Performance & Stress Tests', () => {
    it('should handle rapid successive slugify calls', () => {
      const results = []
      for (let i = 0; i < 100; i++) {
        results.push(slugify(`Item ${i}`))
      }
      expect(results).toHaveLength(100)
      expect(results[0]).toBe('item-0')
      expect(results[99]).toBe('item-99')
    })

    it('should handle batch currency formatting', () => {
      const amounts = [10, 20.5, 100, 999.99, 1500]
      const formatted = amounts.map(amt => formatCurrency(amt))
      
      expect(formatted).toHaveLength(5)
      expect(formatted[0]).toBe('₹10.00')
      expect(formatted[4]).toBe('₹1500.00')
    })

    it('should handle multiple date formats in sequence', () => {
      const dates = [
        new Date('2024-01-01'),
        new Date('2024-06-15'),
        new Date('2024-12-31')
      ]
      
      const formatted = dates.map(d => formatDate(d))
      
      expect(formatted).toHaveLength(3)
      formatted.forEach(f => {
        expect(f).toBeTruthy()
        expect(f).toContain('2024')
      })
    })

    it('should handle complex className combinations', () => {
      const classes = []
      for (let i = 0; i < 10; i++) {
        classes.push(cn(
          'base',
          { active: i % 2 === 0 },
          { disabled: i % 3 === 0 }
        ))
      }
      expect(classes).toHaveLength(10)
    })
  })
})
