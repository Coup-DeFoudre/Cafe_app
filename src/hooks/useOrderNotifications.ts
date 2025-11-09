import { useEffect, useState, useRef } from 'react'
import { OrderNotification } from '@/types'
import { apiGet } from '@/lib/api-client'
import type { OrdersApiResponse } from '@/types'

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

  // Polling function
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

          // Play sound if not muted
          if (!isMuted) {
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
          }
        }
        
        // Update the last known order ID
        lastOrderIdRef.current = latestOrder.id
      }
    } catch (error) {
      console.error('Error checking for new orders:', error)
    }
  }

  // Web Audio API fallback beep sound
  const playBeepSound = () => {
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
  }

  // Set up polling interval
  useEffect(() => {
    // Initial check to set the baseline
    checkForNewOrders()

    // Start polling every 10 seconds
    intervalRef.current = setInterval(checkForNewOrders, 10000) as unknown as number

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isMuted])

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