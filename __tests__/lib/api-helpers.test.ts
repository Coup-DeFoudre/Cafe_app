import { describe, it, expect, beforeEach } from '@jest/globals'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'

describe('API Helper Functions', () => {
  
  describe('successResponse', () => {
    it('should return correct success response format', () => {
      const data = { id: '123', name: 'Test' }
      const response = successResponse(data)
      
      // Parse the JSON response
      const json = response.json()
      
      expect(response.status).toBe(200)
      expect(json).resolves.toMatchObject({
        success: true,
        data: { id: '123', name: 'Test' },
      })
    })

    it('should include data in response', () => {
      const testData = { users: ['user1', 'user2'] }
      const response = successResponse(testData)
      
      expect(response.json()).resolves.toMatchObject({
        success: true,
        data: testData,
      })
    })

    it('should include optional message when provided', () => {
      const data = { result: 'ok' }
      const message = 'Operation completed successfully'
      const response = successResponse(data, message)
      
      expect(response.json()).resolves.toMatchObject({
        success: true,
        data,
        message,
      })
    })

    it('should have status code 200', () => {
      const response = successResponse({ test: true })
      expect(response.status).toBe(200)
    })

    it('should handle empty data object', () => {
      const response = successResponse({})
      
      expect(response.json()).resolves.toMatchObject({
        success: true,
        data: {},
      })
    })
  })

  describe('errorResponse', () => {
    it('should return error format with custom status code', () => {
      const errorMessage = 'Not Found'
      const statusCode = 404
      const response = errorResponse(errorMessage, statusCode)
      
      expect(response.status).toBe(404)
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: errorMessage,
      })
    })

    it('should handle 400 Bad Request error', () => {
      const response = errorResponse('Invalid input', 400)
      
      expect(response.status).toBe(400)
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: 'Invalid input',
      })
    })

    it('should handle 401 Unauthorized error', () => {
      const response = errorResponse('Unauthorized access', 401)
      
      expect(response.status).toBe(401)
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: 'Unauthorized access',
      })
    })

    it('should handle 404 Not Found error', () => {
      const response = errorResponse('Resource not found', 404)
      
      expect(response.status).toBe(404)
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: 'Resource not found',
      })
    })

    it('should handle 500 Internal Server Error', () => {
      const response = errorResponse('Server error occurred', 500)
      
      expect(response.status).toBe(500)
      expect(response.json()).resolves.toMatchObject({
        success: false,
        error: 'Server error occurred',
      })
    })
  })

  describe('handleApiError', () => {
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should handle Prisma errors', () => {
      const prismaError = {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
        message: 'Unique constraint failed',
      }
      
      const response = handleApiError(prismaError)
      
      expect(response.status).toBe(500)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should handle validation errors', () => {
      const validationError = {
        name: 'ZodError',
        issues: [{ message: 'Invalid email' }],
      }
      
      const response = handleApiError(validationError)
      
      expect(response.status).toBe(500)
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should handle generic errors', () => {
      const genericError = new Error('Something went wrong')
      
      const response = handleApiError(genericError)
      
      expect(response.status).toBe(500)
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', genericError)
    })

    it('should log error to console', () => {
      const testError = new Error('Test error')
      
      handleApiError(testError)
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', testError)
    })

    it('should return 500 status for unknown errors', () => {
      const unknownError = { strange: 'error format' }
      
      const response = handleApiError(unknownError)
      
      expect(response.status).toBe(500)
    })
  })
})
