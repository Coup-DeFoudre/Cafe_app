/**
 * Server-side Pusher client for triggering real-time events
 * 
 * Usage:
 * - Import triggerOrderCreated or triggerOrderStatusUpdated from this module
 * - Call from API routes after order creation/updates
 * - Events are sent to private channels: private-cafe-{cafeId}
 * - Multi-tenant isolation ensures cafes only receive their own events
 * - Gracefully degrades if Pusher is not configured (logs warnings instead of throwing)
 */

import Pusher from 'pusher'
import { OrderStatus } from '@prisma/client'
import type { OrderNotification } from '@/types'

// Check for required environment variables
const requiredEnvVars = {
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
}

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key)

/**
 * Flag indicating whether Pusher is properly configured
 */
export const isPusherConfigured = missingVars.length === 0

if (!isPusherConfigured) {
  console.warn(
    `Pusher is not configured. Missing environment variables: ${missingVars.join(', ')}. ` +
    'Real-time notifications will be disabled. ' +
    'Please configure PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, and PUSHER_CLUSTER in your .env file. ' +
    'Get these credentials from https://pusher.com dashboard.'
  )
}

/**
 * Pusher server instance (null if not configured)
 * Configured with TLS encryption for secure WebSocket connections
 */
export const pusherServer: Pusher | null = isPusherConfigured
  ? new Pusher({
      appId: requiredEnvVars.appId!,
      key: requiredEnvVars.key!,
      secret: requiredEnvVars.secret!,
      cluster: requiredEnvVars.cluster!,
      useTLS: true,
    })
  : null

/**
 * Trigger a new order created event
 * Notifies admin dashboard when a new order is placed
 * 
 * @param cafeId - The cafe ID for channel isolation
 * @param orderData - Order notification data
 */
export async function triggerOrderCreated(
  cafeId: string,
  orderData: OrderNotification
): Promise<void> {
  if (!isPusherConfigured || !pusherServer) {
    console.warn('Pusher not configured. Skipping order-created event trigger.')
    return
  }

  try {
    await pusherServer.trigger(
      `private-cafe-${cafeId}`,
      'order-created',
      orderData
    )
  } catch (error) {
    console.error('Failed to trigger order-created event:', error)
    // Don't throw - we don't want to fail the order creation if Pusher fails
  }
}

/**
 * Trigger an order status updated event
 * Notifies both admin dashboard and customer tracking pages
 * 
 * @param cafeId - The cafe ID for channel isolation
 * @param data - Status update data
 */
export async function triggerOrderStatusUpdated(
  cafeId: string,
  data: {
    orderId: string
    status: OrderStatus
    orderNumber: string
  }
): Promise<void> {
  if (!isPusherConfigured || !pusherServer) {
    console.warn('Pusher not configured. Skipping order-status-updated event trigger.')
    return
  }

  try {
    await pusherServer.trigger(
      `private-cafe-${cafeId}`,
      'order-status-updated',
      data
    )
  } catch (error) {
    console.error('Failed to trigger order-status-updated event:', error)
    // Don't throw - we don't want to fail the status update if Pusher fails
  }
}
