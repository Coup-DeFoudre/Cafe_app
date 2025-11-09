'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { getNextOrderStatuses } from '@/lib/utils/order-status'
import { OrderStatus } from '@prisma/client'
import { toast } from 'sonner'

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: OrderStatus
  onStatusUpdate: () => void
}

export function OrderStatusUpdater({ 
  orderId, 
  currentStatus, 
  onStatusUpdate 
}: OrderStatusUpdaterProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  
  const nextOptions = getNextOrderStatuses(currentStatus)

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) return

    // Check if cancelling and show confirmation
    if (selectedStatus === OrderStatus.CANCELLED) {
      setShowCancelConfirm(true)
      return
    }

    await performStatusUpdate()
  }

  const performStatusUpdate = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update order status')
      }

      toast.success(`Order status updated to ${selectedStatus.toLowerCase().replace('_', ' ')}`)
      onStatusUpdate()
      setSelectedStatus('')
      setShowCancelConfirm(false)
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update order status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value as OrderStatus)
  }

  if (nextOptions.length === 0) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No status updates available for this order.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Update Status To:</label>
        <Select value={selectedStatus} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select new status" />
          </SelectTrigger>
          <SelectContent>
            {nextOptions.map((status: OrderStatus) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={handleUpdateStatus}
        disabled={!selectedStatus || selectedStatus === currentStatus || isUpdating}
        className="w-full"
      >
        {isUpdating ? 'Updating...' : 'Update Status'}
      </Button>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone and the order will be marked as cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelConfirm(false)}>
              No, Keep Order
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={performStatusUpdate}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}