'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import DashboardHeader from '@/components/admin/DashboardHeader'
import { OrderFilters } from './OrderFilters'
import { OrderList } from './OrderList'
import { OrderDetailsDialog } from './OrderDetailsDialog'
import { NewOrderNotification } from './NewOrderNotification'
import { useOrderNotifications } from '@/hooks/useOrderNotifications'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { OrderListItem, OrderFiltersState, OrdersApiResponse, Pagination, OrderNotification } from '@/types'
import { OrderStatus } from '@/types'
import { apiGet } from '@/lib/api-client'

interface OrdersPageClientProps {
  initialOrders: OrderListItem[]
  initialPagination: Pagination
  cafeId: string
}

export function OrdersPageClient({ 
  initialOrders, 
  initialPagination, 
  cafeId 
}: OrdersPageClientProps) {
  const [orders, setOrders] = useState<OrderListItem[]>(initialOrders)
  const [pagination, setPagination] = useState<Pagination>(initialPagination)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [filters, setFilters] = useState<OrderFiltersState>({
    status: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING],
    orderType: null,
    paymentMethod: null,
    search: '',
    dateFrom: null,
    dateTo: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Order notifications hook (now using real-time Pusher)
  const { 
    newOrderNotification, 
    dismissNotification, 
    isMuted, 
    toggleMute 
  } = useOrderNotifications()

  const fetchOrders = useCallback(async (page = 1, showLoading = true) => {
    if (showLoading) setIsLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })

      if (filters.status.length > 0) {
        params.set('status', filters.status.join(','))
      }
      if (filters.orderType) {
        params.set('orderType', filters.orderType)
      }
      if (filters.paymentMethod) {
        params.set('paymentMethod', filters.paymentMethod)
      }
      if (filters.search.trim()) {
        params.set('search', filters.search.trim())
      }
      if (filters.dateFrom) {
        params.set('dateFrom', filters.dateFrom)
      }
      if (filters.dateTo) {
        params.set('dateTo', filters.dateTo)
      }

      const data = await apiGet<OrdersApiResponse>(`/api/admin/orders?${params}`)
      setOrders(data.orders)
      setPagination(data.pagination)
      
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [filters, pagination.limit])

  // Real-time order list updates
  const handleNewOrderInList = useCallback((order: OrderNotification) => {
    // Check if order matches current filters
    const matchesStatus = filters.status.length === 0 || filters.status.includes(order.status)
    const matchesType = !filters.orderType || order.orderType === filters.orderType
    
    if (matchesStatus && matchesType && pagination.page === 1) {
      // Trigger a background refresh to get full order details
      fetchOrders(1, false)
    }
  }, [filters.status, filters.orderType, pagination.page, fetchOrders])

  // Subscribe to real-time order updates for the list
  const { isConnected: isRealtimeConnected } = useRealtimeOrders(cafeId, handleNewOrderInList)

  const handleFilterChange = useCallback((newFilters: Partial<OrderFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    fetchOrders(1, false)
  }, [fetchOrders])

  const handleOrderClick = useCallback(async (order: OrderListItem) => {
    try {
      const data = await apiGet(`/api/admin/orders/${order.id}`)
      setSelectedOrder(data)
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Failed to fetch order details')
    }
  }, [])

  const handleStatusUpdate = useCallback(() => {
    setSelectedOrder(null)
    handleRefresh()
  }, [handleRefresh])

  const handleResetFilters = useCallback(() => {
    setFilters({
      status: [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING],
      orderType: null,
      paymentMethod: null,
      search: '',
      dateFrom: null,
      dateTo: null
    })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    fetchOrders(newPage)
  }, [fetchOrders])

  // Debounced search effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchOrders(1)
    }, 500)

    return () => clearTimeout(timeout)
  }, [filters.search, fetchOrders])

  // Fetch orders when other filters change
  useEffect(() => {
    fetchOrders(1)
  }, [filters.status, filters.orderType, filters.paymentMethod, filters.dateFrom, filters.dateTo, fetchOrders])

  const activeFiltersCount = [
    filters.status.length > 0,
    filters.orderType,
    filters.paymentMethod,
    filters.search.trim(),
    filters.dateFrom,
    filters.dateTo
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DashboardHeader 
          title="Orders" 
          description="Manage and track all cafe orders"
        />
        <div className="flex items-center gap-2">
          {isRealtimeConnected ? (
            <div className="flex items-center gap-1.5 text-xs text-green-600 px-2 py-1 bg-green-50 rounded-md">
              <Wifi className="w-3 h-3" />
              <span className="font-medium">Live</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-md">
              <WifiOff className="w-3 h-3" />
              <span className="font-medium">Offline</span>
            </div>
          )}
          <Button 
            onClick={toggleMute}
            variant="outline"
            size="sm"
            className="shrink-0"
            title={isMuted ? 'Enable notifications' : 'Mute notifications'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="shrink-0"
            title="Real-time updates are active. Click to manually refresh if needed."
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <OrderFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {pagination.total} total orders
          {activeFiltersCount > 0 && (
            <span className="ml-2">
              • {orders.length} filtered results
            </span>
          )}
        </div>
        
        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              Previous
            </Button>
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <OrderList 
        orders={orders}
        onOrderClick={handleOrderClick}
        isLoading={isLoading}
      />

      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* New Order Notification */}
      {newOrderNotification && (
        <NewOrderNotification
          order={newOrderNotification}
          onDismiss={dismissNotification}
          onViewOrder={async () => {
            // Fetch the full order details and show dialog
            try {
              const data = await apiGet(`/api/admin/orders/${newOrderNotification.id}`)
              setSelectedOrder(data)
            } catch (error) {
              console.error('Error fetching order details:', error)
              toast.error('Failed to load order details')
            }
            dismissNotification()
          }}
        />
      )}
    </div>
  )
}