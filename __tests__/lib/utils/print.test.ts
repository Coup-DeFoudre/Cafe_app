import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { printOrderReceipt, generateReceiptHTML } from '@/lib/utils/print'
import type { OrderResponse } from '@/lib/mappers/order'
import { OrderType, PaymentMethod, OrderStatus, PaymentStatus } from '@prisma/client'

describe('Print Utilities', () => {
  let mockOrder: OrderResponse
  
  beforeEach(() => {
    mockOrder = {
      id: 'order-123',
      orderNumber: 'ORD-123456',
      customerName: 'John Doe',
      customerPhone: '+91 9876543210',
      orderType: OrderType.DINE_IN,
      tableNumber: '5',
      deliveryAddress: null,
      paymentReferenceId: null,
      specialInstructions: null,
      orderItems: [
        {
          id: 'item-1',
          menuItemId: 'menu-1',
          name: 'Cappuccino',
          price: 150,
          quantity: 2,
          customizations: null,
          subtotal: 300,
        },
        {
          id: 'item-2',
          menuItemId: 'menu-2',
          name: 'Sandwich',
          price: 200,
          quantity: 1,
          customizations: null,
          subtotal: 200,
        },
      ],
      subtotal: 500,
      tax: 90,
      deliveryCharge: 0,
      total: 590,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z',
    }
  })

  describe('generateReceiptHTML', () => {
    it('should generate HTML with correct order number', () => {
      const html = generateReceiptHTML(mockOrder)
      expect(html).toContain('ORD-123456')
    })

    it('should include customer details', () => {
      const html = generateReceiptHTML(mockOrder)
      expect(html).toContain('John Doe')
      expect(html).toContain('+91 9876543210')
    })

    it('should include items list with quantities and prices', () => {
      const html = generateReceiptHTML(mockOrder)
      expect(html).toContain('Cappuccino')
      expect(html).toContain('2')
      expect(html).toContain('150')
      expect(html).toContain('Sandwich')
      expect(html).toContain('1')
      expect(html).toContain('200')
    })

    it('should include total with tax', () => {
      const html = generateReceiptHTML(mockOrder)
      expect(html).toContain('500') // Subtotal
      expect(html).toContain('90')  // Tax
      expect(html).toContain('590') // Total
    })

    it('should format date and time correctly', () => {
      const html = generateReceiptHTML(mockOrder)
      const date = new Date(mockOrder.createdAt)
      const formattedDate = date.toLocaleString()
      expect(html).toContain(formattedDate)
    })

    it('should include delivery charge when present', () => {
      const deliveryOrder = {
        ...mockOrder,
        orderType: OrderType.DELIVERY,
        deliveryCharge: 50,
        total: 640,
      }
      
      const html = generateReceiptHTML(deliveryOrder)
      expect(html).toContain('50') // Delivery charge
      expect(html).toContain('640') // Total with delivery
    })

    it('should include delivery address for delivery orders', () => {
      const deliveryOrder = {
        ...mockOrder,
        orderType: OrderType.DELIVERY,
        deliveryAddress: '123 Main Street, City',
      }
      
      const html = generateReceiptHTML(deliveryOrder)
      expect(html).toContain('123 Main Street, City')
    })

    it('should include table number for dine-in orders', () => {
      const html = generateReceiptHTML(mockOrder)
      expect(html).toContain('Table')
      expect(html).toContain('5')
    })

    it('should display payment method', () => {
      const html = generateReceiptHTML(mockOrder)
      expect(html).toContain('CASH')
      
      const onlineOrder = {
        ...mockOrder,
        paymentMethod: PaymentMethod.ONLINE,
      }
      const onlineHtml = generateReceiptHTML(onlineOrder)
      expect(onlineHtml).toContain('ONLINE')
    })

    it('should handle empty items array', () => {
      const emptyOrder = {
        ...mockOrder,
        orderItems: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      }
      
      const html = generateReceiptHTML(emptyOrder)
      expect(html).toContain('ORD-123456')
      expect(html).toContain('0') // Total
    })
  })

  describe('printOrderReceipt', () => {
    let mockWindow: any
    
    beforeEach(() => {
      // Mock window.open
      mockWindow = {
        document: {
          write: jest.fn(),
          close: jest.fn(),
        },
        print: jest.fn(),
        close: jest.fn(),
      }
      
      global.window = {
        ...global.window,
        open: jest.fn(() => mockWindow) as any,
      } as any
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should open new window for printing', () => {
      printOrderReceipt(mockOrder)
      expect(global.window.open).toHaveBeenCalled()
    })

    it('should write receipt HTML to new window', () => {
      printOrderReceipt(mockOrder)
      expect(mockWindow.document.write).toHaveBeenCalled()
      const writtenContent = (mockWindow.document.write as jest.Mock).mock.calls[0][0]
      expect(writtenContent).toContain('ORD-123456')
    })

    it('should call print on the window', () => {
      printOrderReceipt(mockOrder)
      expect(mockWindow.print).toHaveBeenCalled()
    })

    it('should close document after writing', () => {
      printOrderReceipt(mockOrder)
      expect(mockWindow.document.close).toHaveBeenCalled()
    })

    it('should generate complete receipt HTML', () => {
      printOrderReceipt(mockOrder)
      const writtenContent = (mockWindow.document.write as jest.Mock).mock.calls[0][0]
      expect(writtenContent).toContain('John Doe')
      expect(writtenContent).toContain('Cappuccino')
      expect(writtenContent).toContain('590')
    })
  })
})
