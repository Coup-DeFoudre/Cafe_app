/**
 * React hook for receiving real-time order status updates
 * Used in customer order tracking page for live status updates
 * 
 * Usage:
 * const { isConnected, connectionState } = useRealtimeOrderStatus(
 *   cafeId,
 *   orderId,
 *   (data) => {
 *     // Handle status update for this specific order
 *   }
 * )
 * 
 * Features:
 * - Subscribes to order-status-updated events on cafe's private channel
 * - Filters events to only notify for the specific order
 * - Validates event payload structure
 * - Returns connection state for UI feedback
 */

'use client'

import { useEffect, useCallback } from 'react'
import { usePusher } from './usePusher'
import type { OrderStatusUpdateEvent } from '@/types'

interface UseRealtimeOrderStatusReturn {
  isConnected: boolean
  connectionState: string
}

export function useRealtimeOrderStatus(
  cafeId: string,
  orderId: string,
  onStatusUpdate: (data: OrderStatusUpdateEvent) => void
): UseRealtimeOrderStatusReturn {
  const { isConnected, connectionState, channel } = usePusher(cafeId)

  // Memoize the event handler to prevent unnecessary re-subscriptions
  const handleStatusUpdate = useCallback(
    (data: any) => {
      // Validate payload structure
      if (!data || typeof data !== 'object') {
        console.error('Invalid order-status-updated event payload:', data)
        return
      }

      // Validate required fields
      if (!data.orderId || !data.status || !data.orderNumber) {
        console.error('Missing required fields in order-status-updated event:', data)
        return
      }

      // Filter: only notify if this is the order we're tracking
      if (data.orderId !== orderId) {
        return
      }

      // Call the callback with validated data
      onStatusUpdate(data as OrderStatusUpdateEvent)
    },
    [orderId, onStatusUpdate]
  )

  useEffect(() => {
    // Skip if channel is not available
    if (!channel) {
      return
    }

    // Bind the event listener
    channel.bind('order-status-updated', handleStatusUpdate)

    // Cleanup on unmount or when dependencies change
    return () => {
      channel.unbind('order-status-updated', handleStatusUpdate)
    }
  }, [channel, handleStatusUpdate])

  return {
    isConnected,
    connectionState,
  }
}
