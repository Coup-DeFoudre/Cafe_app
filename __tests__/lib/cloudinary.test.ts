import { describe, it, expect } from '@jest/globals'
import { getOptimizedUrl } from '@/lib/cloudinary'

describe('Cloudinary Utilities', () => {
  
  describe('getOptimizedUrl', () => {
    it('should generate optimized URL with default parameters', () => {
      const publicId = 'sample-image'
      const url = getOptimizedUrl(publicId)
      
      expect(url).toContain(publicId)
      expect(url).toContain('q_auto')
      expect(url).toContain('f_auto')
    })

    it('should generate optimized URL with custom width', () => {
      const publicId = 'sample-image'
      const width = 800
      const url = getOptimizedUrl(publicId, width)
      
      expect(url).toContain(publicId)
      expect(url).toContain(`w_${width}`)
    })

    it('should generate optimized URL with custom height', () => {
      const publicId = 'sample-image'
      const width = 800
      const height = 600
      const url = getOptimizedUrl(publicId, width, height)
      
      expect(url).toContain(publicId)
      expect(url).toContain(`w_${width}`)
      expect(url).toContain(`h_${height}`)
    })

    it('should handle empty publicId gracefully', () => {
      const url = getOptimizedUrl('')
      
      expect(url).toBeDefined()
      expect(typeof url).toBe('string')
    })

    it('should apply quality auto optimization', () => {
      const publicId = 'high-quality-image'
      const url = getOptimizedUrl(publicId, 1024)
      
      expect(url).toContain('q_auto')
      expect(url).toContain(publicId)
    })
  })
})
