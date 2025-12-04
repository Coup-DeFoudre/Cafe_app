import { describe, it, expect } from '@jest/globals'
import { mapOrderToResponse, mapOrdersToResponse, OrderEntity } from '@/lib/mappers/order'
import { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '@prisma/client'

describe('Order Mapper Functions', () => {
  
  const createMockOrderEntity = (overrides?: Partial<OrderEntity>): OrderEntity => ({
    id: 'order-123',
    orderNumber: 'ORD-123456',
    customerName: 'John Doe',
    customerPhone: '+91 9876543210',
    orderType: OrderType.DINE_IN,
    tableNumber: '5',
    deliveryAddress: null,
    status: OrderStatus.PENDING,
    paymentMethod: PaymentMethod.CASH,
    paymentStatus: PaymentStatus.PENDING,
    paymentReferenceId: null,
    specialInstructions: null,
    subtotal: 500,
    tax: 90,
    deliveryCharge: 0,
    total: 590,
    createdAt: new Date('2024-01-15T10:30:00.000Z'),
    updatedAt: new Date('2024-01-15T10:30:00.000Z'),
    ...overrides
  })

  describe('mapOrderToResponse', () => {
    it('should map basic order entity to response format', () => {
      const orderEntity = createMockOrderEntity()
      const response = mapOrderToResponse(orderEntity)

      expect(response.id).toBe('order-123')
      expect(response.orderNumber).toBe('ORD-123456')
      expect(response.customerName).toBe('John Doe')
      expect(response.customerPhone).toBe('+91 9876543210')
    })

    it('should convert Date objects to ISO strings', () => {
      const orderEntity = createMockOrderEntity()
      const response = mapOrderToResponse(orderEntity)

      expect(response.createdAt).toBe('2024-01-15T10:30:00.000Z')
      expect(response.updatedAt).toBe('2024-01-15T10:30:00.000Z')
      expect(typeof response.createdAt).toBe('string')
      expect(typeof response.updatedAt).toBe('string')
    })

    it('should map DINE_IN order type correctly', () => {
      const orderEntity = createMockOrderEntity({
        orderType: OrderType.DINE_IN,
        tableNumber: '10',
        deliveryAddress: null
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.orderType).toBe(OrderType.DINE_IN)
      expect(response.tableNumber).toBe('10')
      expect(response.deliveryAddress).toBeNull()
    })

    it('should map DELIVERY order type correctly', () => {
      const orderEntity = createMockOrderEntity({
        orderType: OrderType.DELIVERY,
        tableNumber: null,
        deliveryAddress: '123 Main St, City'
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.orderType).toBe(OrderType.DELIVERY)
      expect(response.deliveryAddress).toBe('123 Main St, City')
      expect(response.tableNumber).toBeNull()
    })


    it('should map all order statuses correctly', () => {
      const statuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED
      ]

      statuses.forEach(status => {
        const orderEntity = createMockOrderEntity({ status })
        const response = mapOrderToResponse(orderEntity)
        expect(response.status).toBe(status)
      })
    })

    it('should map CASH payment method correctly', () => {
      const orderEntity = createMockOrderEntity({ paymentMethod: PaymentMethod.CASH })
      const response = mapOrderToResponse(orderEntity)
      expect(response.paymentMethod).toBe(PaymentMethod.CASH)
    })

    it('should map ONLINE payment method correctly', () => {
      const orderEntity = createMockOrderEntity({ paymentMethod: PaymentMethod.ONLINE })
      const response = mapOrderToResponse(orderEntity)
      expect(response.paymentMethod).toBe(PaymentMethod.ONLINE)
    })

    it('should map PENDING payment status correctly', () => {
      const orderEntity = createMockOrderEntity({ paymentStatus: PaymentStatus.PENDING })
      const response = mapOrderToResponse(orderEntity)
      expect(response.paymentStatus).toBe(PaymentStatus.PENDING)
    })

    it('should map PAID payment status correctly', () => {
      const orderEntity = createMockOrderEntity({ paymentStatus: PaymentStatus.PAID })
      const response = mapOrderToResponse(orderEntity)
      expect(response.paymentStatus).toBe(PaymentStatus.PAID)
    })

    it('should map FAILED payment status correctly', () => {
      const orderEntity = createMockOrderEntity({ paymentStatus: PaymentStatus.FAILED })
      const response = mapOrderToResponse(orderEntity)
      expect(response.paymentStatus).toBe(PaymentStatus.FAILED)
    })

    it('should include payment reference ID when present', () => {
      const orderEntity = createMockOrderEntity({
        paymentReferenceId: 'PAY-123-XYZ'
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.paymentReferenceId).toBe('PAY-123-XYZ')
    })

    it('should handle null payment reference ID', () => {
      const orderEntity = createMockOrderEntity({
        paymentReferenceId: null
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.paymentReferenceId).toBeNull()
    })

    it('should include special instructions when present', () => {
      const orderEntity = createMockOrderEntity({
        specialInstructions: 'Extra spicy, no onions'
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.specialInstructions).toBe('Extra spicy, no onions')
    })

    it('should handle null special instructions', () => {
      const orderEntity = createMockOrderEntity({
        specialInstructions: null
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.specialInstructions).toBeNull()
    })

    it('should map financial fields correctly', () => {
      const orderEntity = createMockOrderEntity({
        subtotal: 1000,
        tax: 180,
        deliveryCharge: 50,
        total: 1230
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.subtotal).toBe(1000)
      expect(response.tax).toBe(180)
      expect(response.deliveryCharge).toBe(50)
      expect(response.total).toBe(1230)
    })

    it('should handle zero delivery charge', () => {
      const orderEntity = createMockOrderEntity({
        deliveryCharge: 0
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.deliveryCharge).toBe(0)
    })

    it('should calculate itemCount from itemCount field if present', () => {
      const orderEntity = createMockOrderEntity({
        itemCount: 5
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.itemCount).toBe(5)
    })

    it('should calculate itemCount from orderItems length if itemCount not present', () => {
      const orderEntity = createMockOrderEntity({
        itemCount: undefined,
        orderItems: [{}, {}, {}]
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.itemCount).toBe(3)
    })

    it('should default itemCount to 0 if neither field present', () => {
      const orderEntity = createMockOrderEntity({
        itemCount: undefined,
        orderItems: undefined
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.itemCount).toBe(0)
    })

    it('should include orderItems array when present', () => {
      const mockItems = [
        { id: 'item-1', name: 'Coffee', quantity: 2 },
        { id: 'item-2', name: 'Sandwich', quantity: 1 }
      ]
      const orderEntity = createMockOrderEntity({
        orderItems: mockItems
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.orderItems).toEqual(mockItems)
      expect(response.orderItems).toHaveLength(2)
    })

    it('should include cafe information when present', () => {
      const orderEntity = createMockOrderEntity({
        cafe: {
          name: 'Amazing Cafe',
          logo: '/logos/cafe.png',
          phone: '+91 1234567890'
        }
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.cafe).toEqual({
        name: 'Amazing Cafe',
        logo: '/logos/cafe.png',
        phone: '+91 1234567890'
      })
    })

    it('should handle cafe with null logo', () => {
      const orderEntity = createMockOrderEntity({
        cafe: {
          name: 'Simple Cafe',
          logo: null,
          phone: null
        }
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.cafe?.name).toBe('Simple Cafe')
      expect(response.cafe?.logo).toBeNull()
      expect(response.cafe?.phone).toBeNull()
    })

    it('should handle missing cafe information', () => {
      const orderEntity = createMockOrderEntity({
        cafe: undefined
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.cafe).toBeUndefined()
    })

    it('should preserve all fields during mapping', () => {
      const orderEntity = createMockOrderEntity()
      const response = mapOrderToResponse(orderEntity)

      expect(Object.keys(response)).toContain('id')
      expect(Object.keys(response)).toContain('orderNumber')
      expect(Object.keys(response)).toContain('status')
      expect(Object.keys(response)).toContain('total')
      expect(Object.keys(response)).toContain('createdAt')
      expect(Object.keys(response)).toContain('updatedAt')
    })

    it('should handle decimal amounts correctly', () => {
      const orderEntity = createMockOrderEntity({
        subtotal: 99.99,
        tax: 17.99,
        deliveryCharge: 25.50,
        total: 143.48
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.subtotal).toBe(99.99)
      expect(response.tax).toBe(17.99)
      expect(response.deliveryCharge).toBe(25.50)
      expect(response.total).toBe(143.48)
    })

    it('should handle large order amounts', () => {
      const orderEntity = createMockOrderEntity({
        subtotal: 10000,
        tax: 1800,
        total: 11800
      })
      const response = mapOrderToResponse(orderEntity)

      expect(response.subtotal).toBe(10000)
      expect(response.tax).toBe(1800)
      expect(response.total).toBe(11800)
    })
  })

  describe('mapOrdersToResponse', () => {
    it('should map empty array correctly', () => {
      const result = mapOrdersToResponse([])
      
      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should map single order in array', () => {
      const orderEntity = createMockOrderEntity()
      const result = mapOrdersToResponse([orderEntity])

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('order-123')
      expect(result[0].orderNumber).toBe('ORD-123456')
    })

    it('should map multiple orders correctly', () => {
      const orders = [
        createMockOrderEntity({ id: 'order-1', orderNumber: 'ORD-001' }),
        createMockOrderEntity({ id: 'order-2', orderNumber: 'ORD-002' }),
        createMockOrderEntity({ id: 'order-3', orderNumber: 'ORD-003' })
      ]
      const result = mapOrdersToResponse(orders)

      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('order-1')
      expect(result[1].id).toBe('order-2')
      expect(result[2].id).toBe('order-3')
    })

    it('should preserve order sequence', () => {
      const orders = [
        createMockOrderEntity({ orderNumber: 'ORD-100' }),
        createMockOrderEntity({ orderNumber: 'ORD-200' }),
        createMockOrderEntity({ orderNumber: 'ORD-300' })
      ]
      const result = mapOrdersToResponse(orders)

      expect(result[0].orderNumber).toBe('ORD-100')
      expect(result[1].orderNumber).toBe('ORD-200')
      expect(result[2].orderNumber).toBe('ORD-300')
    })

    it('should map orders with different statuses', () => {
      const orders = [
        createMockOrderEntity({ status: OrderStatus.PENDING }),
        createMockOrderEntity({ status: OrderStatus.CONFIRMED }),
        createMockOrderEntity({ status: OrderStatus.COMPLETED })
      ]
      const result = mapOrdersToResponse(orders)

      expect(result[0].status).toBe(OrderStatus.PENDING)
      expect(result[1].status).toBe(OrderStatus.CONFIRMED)
      expect(result[2].status).toBe(OrderStatus.COMPLETED)
    })

    it('should map orders with different types', () => {
      const orders = [
        createMockOrderEntity({ orderType: OrderType.DINE_IN, tableNumber: '1' }),
        createMockOrderEntity({ orderType: OrderType.DELIVERY, deliveryAddress: '123 St' })
      ]
      const result = mapOrdersToResponse(orders)

      expect(result[0].orderType).toBe(OrderType.DINE_IN)
      expect(result[1].orderType).toBe(OrderType.DELIVERY)
    })

    it('should handle large arrays of orders', () => {
      const orders = Array.from({ length: 100 }, (_, i) => 
        createMockOrderEntity({ id: `order-${i}`, orderNumber: `ORD-${i}` })
      )
      const result = mapOrdersToResponse(orders)

      expect(result).toHaveLength(100)
      expect(result[0].id).toBe('order-0')
      expect(result[99].id).toBe('order-99')
    })

    it('should convert all dates to ISO strings in batch', () => {
      const orders = [
        createMockOrderEntity({ createdAt: new Date('2024-01-01T10:00:00Z') }),
        createMockOrderEntity({ createdAt: new Date('2024-02-01T10:00:00Z') }),
        createMockOrderEntity({ createdAt: new Date('2024-03-01T10:00:00Z') })
      ]
      const result = mapOrdersToResponse(orders)

      result.forEach(order => {
        expect(typeof order.createdAt).toBe('string')
        expect(typeof order.updatedAt).toBe('string')
      })
    })

    it('should handle orders with and without cafe info', () => {
      const orders = [
        createMockOrderEntity({ cafe: { name: 'Cafe A', logo: null, phone: null } }),
        createMockOrderEntity({ cafe: undefined }),
        createMockOrderEntity({ cafe: { name: 'Cafe B', logo: '/logo.png', phone: '123' } })
      ]
      const result = mapOrdersToResponse(orders)

      expect(result[0].cafe?.name).toBe('Cafe A')
      expect(result[1].cafe).toBeUndefined()
      expect(result[2].cafe?.name).toBe('Cafe B')
    })

    it('should calculate itemCount for all orders', () => {
      const orders = [
        createMockOrderEntity({ itemCount: 3 }),
        createMockOrderEntity({ orderItems: [{}, {}, {}, {}] }),
        createMockOrderEntity({ itemCount: 5, orderItems: [{}, {}] })
      ]
      const result = mapOrdersToResponse(orders)

      expect(result[0].itemCount).toBe(3)
      expect(result[1].itemCount).toBe(4)
      expect(result[2].itemCount).toBe(5)
    })
  })

  describe('Edge Cases and Integration', () => {
    it('should handle complete order lifecycle mapping', () => {
      const orderEntity = createMockOrderEntity({
        status: OrderStatus.PENDING,
        createdAt: new Date('2024-01-01T10:00:00Z')
      })

      const response1 = mapOrderToResponse(orderEntity)
      expect(response1.status).toBe(OrderStatus.PENDING)

      const updatedOrder = { ...orderEntity, status: OrderStatus.COMPLETED }
      const response2 = mapOrderToResponse(updatedOrder)
      expect(response2.status).toBe(OrderStatus.COMPLETED)
    })

    it('should handle mixed payment methods in batch', () => {
      const orders = [
        createMockOrderEntity({ paymentMethod: PaymentMethod.CASH }),
        createMockOrderEntity({ paymentMethod: PaymentMethod.ONLINE }),
        createMockOrderEntity({ paymentMethod: PaymentMethod.CASH }),
        createMockOrderEntity({ paymentMethod: PaymentMethod.ONLINE })
      ]
      const result = mapOrdersToResponse(orders)

      expect(result.map(o => o.paymentMethod)).toEqual([
        PaymentMethod.CASH,
        PaymentMethod.ONLINE,
        PaymentMethod.CASH,
        PaymentMethod.ONLINE
      ])
    })

    it('should preserve financial data integrity across mapping', () => {
      const orderEntity = createMockOrderEntity({
        subtotal: 500,
        tax: 90,
        deliveryCharge: 50,
        total: 640
      })
      const response = mapOrderToResponse(orderEntity)

      const calculatedTotal = response.subtotal + response.tax + response.deliveryCharge
      expect(response.total).toBe(calculatedTotal)
    })
  })
})
