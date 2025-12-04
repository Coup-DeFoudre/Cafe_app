import { describe, it, expect } from '@jest/globals'
import {
  DEFAULT_CAFE_SLUG,
  PLACEHOLDER_IMAGES,
  DIETARY_INDICATORS,
  DEBOUNCE_DELAY,
  ITEMS_PER_PAGE,
} from '@/lib/constants'

describe('Application Constants', () => {
  
  describe('DEFAULT_CAFE_SLUG', () => {
    it('should have a default cafe slug', () => {
      expect(DEFAULT_CAFE_SLUG).toBeDefined()
      expect(typeof DEFAULT_CAFE_SLUG).toBe('string')
    })

    it('should be a valid slug format', () => {
      expect(DEFAULT_CAFE_SLUG).toBe('sample-cafe')
      expect(DEFAULT_CAFE_SLUG).toMatch(/^[a-z0-9-]+$/)
    })
  })

  describe('PLACEHOLDER_IMAGES', () => {
    it('should have placeholder images object', () => {
      expect(PLACEHOLDER_IMAGES).toBeDefined()
      expect(typeof PLACEHOLDER_IMAGES).toBe('object')
    })

    it('should have menuItem placeholder', () => {
      expect(PLACEHOLDER_IMAGES.menuItem).toBeDefined()
      expect(typeof PLACEHOLDER_IMAGES.menuItem).toBe('string')
      expect(PLACEHOLDER_IMAGES.menuItem).toContain('unsplash.com')
    })

    it('should have logo placeholder', () => {
      expect(PLACEHOLDER_IMAGES.logo).toBeDefined()
      expect(typeof PLACEHOLDER_IMAGES.logo).toBe('string')
      expect(PLACEHOLDER_IMAGES.logo).toContain('unsplash.com')
    })

    it('should have banner placeholder', () => {
      expect(PLACEHOLDER_IMAGES.banner).toBeDefined()
      expect(typeof PLACEHOLDER_IMAGES.banner).toBe('string')
      expect(PLACEHOLDER_IMAGES.banner).toContain('unsplash.com')
    })

    it('should have valid URL format for all images', () => {
      Object.values(PLACEHOLDER_IMAGES).forEach(url => {
        expect(url).toMatch(/^https:\/\//)
      })
    })
  })

  describe('DIETARY_INDICATORS', () => {
    it('should have dietary indicators object', () => {
      expect(DIETARY_INDICATORS).toBeDefined()
      expect(typeof DIETARY_INDICATORS).toBe('object')
    })

    it('should have veg indicator', () => {
      expect(DIETARY_INDICATORS.veg).toBeDefined()
      expect(DIETARY_INDICATORS.veg.color).toBe('green')
      expect(DIETARY_INDICATORS.veg.label).toBe('Veg')
      expect(DIETARY_INDICATORS.veg.icon).toBe('circle')
    })

    it('should have nonveg indicator', () => {
      expect(DIETARY_INDICATORS.nonveg).toBeDefined()
      expect(DIETARY_INDICATORS.nonveg.color).toBe('red')
      expect(DIETARY_INDICATORS.nonveg.label).toBe('Non-Veg')
      expect(DIETARY_INDICATORS.nonveg.icon).toBe('circle')
    })

    it('should have correct structure for indicators', () => {
      const { veg, nonveg } = DIETARY_INDICATORS
      
      expect(veg).toHaveProperty('color')
      expect(veg).toHaveProperty('label')
      expect(veg).toHaveProperty('icon')
      
      expect(nonveg).toHaveProperty('color')
      expect(nonveg).toHaveProperty('label')
      expect(nonveg).toHaveProperty('icon')
    })
  })

  describe('DEBOUNCE_DELAY', () => {
    it('should have a debounce delay', () => {
      expect(DEBOUNCE_DELAY).toBeDefined()
      expect(typeof DEBOUNCE_DELAY).toBe('number')
    })

    it('should be 300 milliseconds', () => {
      expect(DEBOUNCE_DELAY).toBe(300)
    })

   it('should be a positive number', () => {
      expect(DEBOUNCE_DELAY).toBeGreaterThan(0)
    })
  })

  describe('ITEMS_PER_PAGE', () => {
    it('should have items per page constant', () => {
      expect(ITEMS_PER_PAGE).toBeDefined()
      expect(typeof ITEMS_PER_PAGE).toBe('number')
    })

    it('should be 12 items', () => {
      expect(ITEMS_PER_PAGE).toBe(12)
    })

    it('should be a positive integer', () => {
      expect(ITEMS_PER_PAGE).toBeGreaterThan(0)
      expect(Number.isInteger(ITEMS_PER_PAGE)).toBe(true)
    })
  })
})
