import { describe, it, expect } from '@jest/globals'
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getNextOrderStatuses,
  canTransitionStatus,
  getOrderStatusIcon,
} from '@/lib/utils/order-status'
import { OrderStatus } from '@prisma/client'
import {
  Clock,
  CheckCircle,
  ChefHat,
  Bell,
  CircleCheck,
  XCircle,
} from 'lucide-react'

describe('Order Status Utilities', () => {
  
  describe('getOrderStatusColor', () => {
    it('should return yellow for PENDING status', () => {
      const color = getOrderStatusColor(OrderStatus.PENDING)
      expect(color).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return blue for CONFIRMED status', () => {
      const color = getOrderStatusColor(OrderStatus.CONFIRMED)
      expect(color).toBe('bg-blue-100 text-blue-800')
    })

    it('should return orange for PREPARING status', () => {
      const color = getOrderStatusColor(OrderStatus.PREPARING)
      expect(color).toBe('bg-orange-100 text-orange-800')
    })

    it('should return green for READY status', () => {
      const color = getOrderStatusColor(OrderStatus.READY)
      expect(color).toBe('bg-green-100 text-green-800')
    })

    it('should return green for COMPLETED status', () => {
      const color = getOrderStatusColor(OrderStatus.COMPLETED)
      expect(color).toBe('bg-green-100 text-green-800')
    })

    it('should return red for CANCELLED status', () => {
      const color = getOrderStatusColor(OrderStatus.CANCELLED)
      expect(color).toBe('bg-red-100 text-red-800')
    })
  })

  describe('getOrderStatusLabel', () => {
    it('should return "Pending" for PENDING status', () => {
      expect(getOrderStatusLabel(OrderStatus.PENDING)).toBe('Pending')
    })

    it('should return "Confirmed" for CONFIRMED status', () => {
      expect(getOrderStatusLabel(OrderStatus.CONFIRMED)).toBe('Confirmed')
    })

    it('should return "Preparing" for PREPARING status', () => {
      expect(getOrderStatusLabel(OrderStatus.PREPARING)).toBe('Preparing')
    })

    it('should return "Ready" for READY status', () => {
      expect(getOrderStatusLabel(OrderStatus.READY)).toBe('Ready')
    })

    it('should return "Completed" for COMPLETED status', () => {
      expect(getOrderStatusLabel(OrderStatus.COMPLETED)).toBe('Completed')
    })

    it('should return "Cancelled" for CANCELLED status', () => {
      expect(getOrderStatusLabel(OrderStatus.CANCELLED)).toBe('Cancelled')
    })
  })

  describe('getNextOrderStatuses', () => {
    it('should return CONFIRMED and CANCELLED for PENDING status', () => {
      const nextStatuses = getNextOrderStatuses(OrderStatus.PENDING)
      expect(nextStatuses).toEqual([OrderStatus.CONFIRMED, OrderStatus.CANCELLED])
    })

    it('should return PREPARING and CANCELLED for CONFIRMED status', () => {
      const nextStatuses = getNextOrderStatuses(OrderStatus.CONFIRMED)
      expect(nextStatuses).toEqual([OrderStatus.PREPARING, OrderStatus.CANCELLED])
    })

    it('should return READY and CANCELLED for PREPARING status', () => {
      const nextStatuses = getNextOrderStatuses(OrderStatus.PREPARING)
      expect(nextStatuses).toEqual([OrderStatus.READY, OrderStatus.CANCELLED])
    })

    it('should return COMPLETED for READY status', () => {
      const nextStatuses = getNextOrderStatuses(OrderStatus.READY)
      expect(nextStatuses).toEqual([OrderStatus.COMPLETED])
    })

    it('should return empty array for COMPLETED status', () => {
      const nextStatuses = getNextOrderStatuses(OrderStatus.COMPLETED)
      expect(nextStatuses).toEqual([])
    })

    it('should return empty array for CANCELLED status', () => {
      const nextStatuses = getNextOrderStatuses(OrderStatus.CANCELLED)
      expect(nextStatuses).toEqual([])
    })
  })

  describe('canTransitionStatus', () => {
    it('should allow transition from PENDING to CONFIRMED', () => {
      expect(canTransitionStatus(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true)
    })

    it('should allow transition from PENDING to CANCELLED', () => {
      expect(canTransitionStatus(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true)
    })

    it('should not allow transition from PENDING to PREPARING', () => {
      expect(canTransitionStatus(OrderStatus.PENDING, OrderStatus.PREPARING)).toBe(false)
    })

    it('should allow transition from CONFIRMED to PREPARING', () => {
      expect(canTransitionStatus(OrderStatus.CONFIRMED, OrderStatus.PREPARING)).toBe(true)
    })

    it('should allow transition from PREPARING to READY', () => {
      expect(canTransitionStatus(OrderStatus.PREPARING, OrderStatus.READY)).toBe(true)
    })

    it('should allow transition from READY to COMPLETED', () => {
      expect(canTransitionStatus(OrderStatus.READY, OrderStatus.COMPLETED)).toBe(true)
    })

    it('should not allow transition from COMPLETED to any status', () => {
      expect(canTransitionStatus(OrderStatus.COMPLETED, OrderStatus.PENDING)).toBe(false)
      expect(canTransitionStatus(OrderStatus.COMPLETED, OrderStatus.CONFIRMED)).toBe(false)
      expect(canTransitionStatus(OrderStatus.COMPLETED, OrderStatus.PREPARING)).toBe(false)
    })

    it('should not allow transition from CANCELLED to any status', () => {
      expect(canTransitionStatus(OrderStatus.CANCELLED, OrderStatus.PENDING)).toBe(false)
      expect(canTransitionStatus(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toBe(false)
      expect(canTransitionStatus(OrderStatus.CANCELLED, OrderStatus.PREPARING)).toBe(false)
    })

    it('should not allow same status transition', () => {
      expect(canTransitionStatus(OrderStatus.PENDING, OrderStatus.PENDING)).toBe(false)
      expect(canTransitionStatus(OrderStatus.CONFIRMED, OrderStatus.CONFIRMED)).toBe(false)
    })
  })

  describe('getOrderStatusIcon', () => {
    it('should return Clock icon for PENDING status', () => {
      const Icon = getOrderStatusIcon(OrderStatus.PENDING)
      expect(Icon).toBe(Clock)
    })

    it('should return CheckCircle icon for CONFIRMED status', () => {
      const Icon = getOrderStatusIcon(OrderStatus.CONFIRMED)
      expect(Icon).toBe(CheckCircle)
    })

    it('should return ChefHat icon for PREPARING status', () => {
      const Icon = getOrderStatusIcon(OrderStatus.PREPARING)
      expect(Icon).toBe(ChefHat)
    })

    it('should return Bell icon for READY status', () => {
      const Icon = getOrderStatusIcon(OrderStatus.READY)
      expect(Icon).toBe(Bell)
    })

    it('should return CircleCheck icon for COMPLETED status', () => {
      const Icon = getOrderStatusIcon(OrderStatus.COMPLETED)
      expect(Icon).toBe(CircleCheck)
    })

    it('should return XCircle icon for CANCELLED status', () => {
      const Icon = getOrderStatusIcon(OrderStatus.CANCELLED)
      expect(Icon).toBe(XCircle)
    })
  })
})
