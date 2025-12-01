/**
 * React hook for admin order notifications
 * Replaced polling with real-time Pusher subscriptions for instant notifications
 * 
 * Features:
 * - Real-time order notifications via Pusher WebSocket
 * - Sound alerts (with mute toggle)
 * - Graceful fallback to polling if Pusher is not configured
 * - Persistent mute preference in localStorage
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRealtimeOrders } from './useRealtimeOrders'
import { OrderNotification } from '@/types'
import { apiGet } from '@/lib/api-client'
import type { OrdersApiResponse } from '@/types'
import { pusherClient } from '@/lib/pusher-client'

interface UseOrderNotificationsReturn {
  newOrderNotification: OrderNotification | null
  dismissNotification: () => void
  isMuted: boolean
  toggleMute: () => void
}

export function useOrderNotifications(): UseOrderNotificationsReturn {
  const [newOrderNotification, setNewOrderNotification] = useState<OrderNotification | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const lastOrderIdRef = useRef<string | null>(null)
  const intervalRef = useRef<number | null>(null)
  const { data: session } = useSession()
  const cafeId = session?.user?.cafeId

  // Load mute preference from localStorage
  useEffect(() => {
    const mutePref = localStorage.getItem('orderNotificationsMuted')
    setIsMuted(mutePref === 'true')
  }, [])

  // Save mute preference to localStorage
  const toggleMute = () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)
    localStorage.setItem('orderNotificationsMuted', newMutedState.toString())
  }

  // Web Audio API fallback beep sound
  const playBeepSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.error('Web Audio API not supported:', error)
    }
  }, [])

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (isMuted) return

    try {
      const audio = new Audio('/sounds/notification.mp3')
      audio.play().catch(() => {
        // Fallback to Web Audio API beep
        playBeepSound()
      })
    } catch {
      // Fallback to Web Audio API beep
      playBeepSound()
    }
  }, [isMuted, playBeepSound])

  // Handle new order from real-time subscription
  const handleNewOrder = useCallback((order: OrderNotification) => {
    // Check if this is a new order (deduplication)
    if (lastOrderIdRef.current && lastOrderIdRef.current === order.id) {
      return
    }

    // Update last known order ID
    lastOrderIdRef.current = order.id

    // Set notification
    setNewOrderNotification(order)

    // Play sound
    playNotificationSound()
  }, [playNotificationSound])

  // Real-time subscription (if Pusher is configured and cafeId is available)
  const { isConnected } = useRealtimeOrders(cafeId || '', handleNewOrder)

  // Fallback polling if Pusher is not configured
  useEffect(() => {
    if (pusherClient && cafeId) {
      // Pusher is configured, no need for polling
      return
    }

    // Pusher not available, fall back to polling
    console.warn('Pusher not configured. Falling back to polling for order notifications.')

    const checkForNewOrders = async () => {
      try {
        const { orders } = await apiGet<OrdersApiResponse>('/api/admin/orders?page=1&limit=1')
        if (orders.length > 0) {
          const latestOrder = orders[0]
          
          // Check if this is a new order
          if (lastOrderIdRef.current && lastOrderIdRef.current !== latestOrder.id) {
            // New order detected
            const notification: OrderNotification = {
              id: latestOrder.id,
              orderNumber: latestOrder.orderNumber,
              customerName: latestOrder.customerName,
              total: latestOrder.total,
              orderType: latestOrder.orderType,
              status: latestOrder.status,
              createdAt: latestOrder.createdAt
            }

            setNewOrderNotification(notification)
            playNotificationSound()
          }
          
          // Update the last known order ID
          lastOrderIdRef.current = latestOrder.id
        }
      } catch (error) {
        console.error('Error checking for new orders:', error)
      }
    }

    // Initial check to set the baseline
    checkForNewOrders()

    // Start polling every 10 seconds
    intervalRef.current = setInterval(checkForNewOrders, 10000) as unknown as number

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [cafeId, isMuted, playNotificationSound])

  const dismissNotification = () => {
    setNewOrderNotification(null)
  }

  return {
    newOrderNotification,
    dismissNotification,
    isMuted,
    toggleMute
  }
}
