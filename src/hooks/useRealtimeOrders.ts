/**
 * React hook for receiving real-time order creation notifications
 * Used in admin dashboard to replace polling mechanism
 * 
 * Usage:
 * const { isConnected, connectionState } = useRealtimeOrders(cafeId, (order) => {
 *   // Handle new order notification
 * })
 * 
 * Features:
 * - Subscribes to order-created events on cafe's private channel
 * - Validates event payload structure
 * - Returns connection state for UI feedback
 */

'use client'

import { useEffect, useCallback } from 'react'
import { usePusher } from './usePusher'
import type { OrderNotification } from '@/types'

interface UseRealtimeOrdersReturn {
  isConnected: boolean
  connectionState: string
}

export function useRealtimeOrders(
  cafeId: string,
  onNewOrder: (order: OrderNotification) => void
): UseRealtimeOrdersReturn {
  const { isConnected, connectionState, channel } = usePusher(cafeId)

  // Memoize the event handler to prevent unnecessary re-subscriptions
  const handleOrderCreated = useCallback(
    (data: any) => {
      // Validate payload structure
      if (!data || typeof data !== 'object') {
        console.error('Invalid order-created event payload:', data)
        return
      }

      // Validate required fields
      const requiredFields = ['id', 'orderNumber', 'customerName', 'total', 'status']
      const missingFields = requiredFields.filter((field) => !(field in data))

      if (missingFields.length > 0) {
        console.error('Missing required fields in order-created event:', missingFields)
        return
      }

      // Call the callback with validated data
      onNewOrder(data as OrderNotification)
    },
    [onNewOrder]
  )

  useEffect(() => {
    // Skip if channel is not available
    if (!channel) {
      return
    }

    // Bind the event listener
    channel.bind('order-created', handleOrderCreated)

    // Cleanup on unmount or when dependencies change
    return () => {
      channel.unbind('order-created', handleOrderCreated)
    }
  }, [channel, handleOrderCreated])

  return {
    isConnected,
    connectionState,
  }
}
