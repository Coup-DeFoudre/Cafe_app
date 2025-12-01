/**
 * React hook for managing Pusher connection lifecycle
 * Handles automatic reconnection with exponential backoff
 * 
 * Usage:
 * const { isConnected, connectionState, channel } = usePusher(cafeId)
 * 
 * Features:
 * - Automatic subscription to cafe-specific private channel
 * - Connection state tracking
 * - Automatic reconnection on disconnect (max 5 attempts)
 * - Exponential backoff for reconnection attempts
 * - Cleanup on unmount
 */

'use client'

import { useEffect, useRef, useState } from 'react'
import { pusherClient } from '@/lib/pusher-client'
import type { Channel } from 'pusher-js'

interface UsePusherReturn {
  isConnected: boolean
  connectionState: string
  channel: Channel | null
}

const MAX_RECONNECT_ATTEMPTS = 5
const INITIAL_RECONNECT_DELAY = 3000 // 3 seconds

export function usePusher(cafeId: string | null): UsePusherReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState('disconnected')
  const channelRef = useRef<Channel | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Skip if Pusher is not configured or cafeId is not provided
    if (!pusherClient || !cafeId) {
      setIsConnected(false)
      setConnectionState('disconnected')
      return
    }

    // Subscribe to the cafe's private channel
    const channelName = `private-cafe-${cafeId}`
    const channel = pusherClient.subscribe(channelName)
    channelRef.current = channel

    // Connection state change handler
    const handleStateChange = (states: { current: string; previous: string }) => {
      setConnectionState(states.current)
      
      if (states.current === 'connected') {
        setIsConnected(true)
        reconnectAttemptsRef.current = 0 // Reset reconnect attempts on successful connection
      } else {
        setIsConnected(false)
      }
    }

    // Connected event handler
    const handleConnected = () => {
      setIsConnected(true)
      setConnectionState('connected')
      reconnectAttemptsRef.current = 0
    }

    // Disconnected event handler with reconnection logic
    const handleDisconnected = () => {
      setIsConnected(false)
      setConnectionState('disconnected')

      // Attempt reconnection with exponential backoff
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && pusherClient) {
        const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current)
        reconnectAttemptsRef.current++

        console.log(
          `Pusher disconnected. Attempting reconnection ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`
        )

        reconnectTimeoutRef.current = setTimeout(() => {
          pusherClient?.connect()
        }, delay)
      } else {
        console.error('Max reconnection attempts reached. Please refresh the page.')
      }
    }

    // Error event handler
    const handleError = (error: any) => {
      console.error('Pusher error:', error)
      setIsConnected(false)

      // Attempt reconnection on error
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS && pusherClient) {
        const delay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current)
        reconnectAttemptsRef.current++

        reconnectTimeoutRef.current = setTimeout(() => {
          pusherClient?.connect()
        }, delay)
      }
    }

    // Bind event listeners
    pusherClient.connection.bind('state_change', handleStateChange)
    pusherClient.connection.bind('connected', handleConnected)
    pusherClient.connection.bind('disconnected', handleDisconnected)
    pusherClient.connection.bind('error', handleError)

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      if (pusherClient) {
        pusherClient.connection.unbind('state_change', handleStateChange)
        pusherClient.connection.unbind('connected', handleConnected)
        pusherClient.connection.unbind('disconnected', handleDisconnected)
        pusherClient.connection.unbind('error', handleError)

        if (channelRef.current) {
          pusherClient.unsubscribe(channelName)
          channelRef.current = null
        }
      }
    }
  }, [cafeId])

  return {
    isConnected,
    connectionState,
    channel: channelRef.current,
  }
}
