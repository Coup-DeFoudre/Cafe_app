/**
 * Client-side Pusher client for subscribing to real-time events
 * 
 * Usage:
 * - Import pusherClient from this module in client components only
 * - Use in React hooks to manage subscriptions
 * - Check if pusherClient is null before using (graceful degradation)
 * - Subscribe to channels: private-cafe-{cafeId}
 * 
 * Note: This should only be imported in client components ('use client')
 */

import Pusher from 'pusher-js'

const key = process.env.NEXT_PUBLIC_PUSHER_KEY
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

// Graceful degradation if Pusher is not configured
if (!key || !cluster) {
  console.warn(
    'Pusher configuration missing. Real-time features will be disabled. ' +
    'Please set NEXT_PUBLIC_PUSHER_KEY and NEXT_PUBLIC_PUSHER_CLUSTER environment variables.'
  )
}

/**
 * Pusher client instance
 * Configured for WebSocket-only connections with TLS encryption
 * Returns null if environment variables are not configured
 */
export const pusherClient: Pusher | null = key && cluster
  ? new Pusher(key, {
      cluster,
      forceTLS: true,
      enabledTransports: ['ws', 'wss'],
      disabledTransports: ['sockjs', 'xhr_polling', 'xhr_streaming'],
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    })
  : null

// Connection state logging for debugging
if (pusherClient) {
  pusherClient.connection.bind('connected', () => {
    console.log('Pusher connected')
  })

  pusherClient.connection.bind('disconnected', () => {
    console.log('Pusher disconnected')
  })

  pusherClient.connection.bind('error', (error: any) => {
    console.error('Pusher connection error:', error)
  })
}
