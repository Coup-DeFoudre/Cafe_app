'use client'

import { useState } from 'react'
import { Search, Calendar, X, UtensilsCrossed, Truck, Banknote, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from './OrderStatusBadge'
import { OrderStatus, OrderType, PaymentMethod, OrderFiltersState } from '@/types'

interface OrderFiltersProps {
  filters: OrderFiltersState
  onFilterChange: (filters: Partial<OrderFiltersState>) => void
  onReset: () => void
}

export function OrderFilters({ filters, onFilterChange, onReset }: OrderFiltersProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>(filters.status)

  const handleStatusChange = (status: string) => {
    const orderStatus = status as OrderStatus
    const newStatuses = selectedStatuses.includes(orderStatus)
      ? selectedStatuses.filter(s => s !== orderStatus)
      : [...selectedStatuses, orderStatus]
    
    setSelectedStatuses(newStatuses)
    onFilterChange({ status: newStatuses })
  }

  const handleSearchChange = (value: string) => {
    onFilterChange({ search: value })
  }

  const handleOrderTypeChange = (value: string) => {
    onFilterChange({ orderType: value === 'all' ? null : value as OrderType })
  }

  const handlePaymentMethodChange = (value: string) => {
    onFilterChange({ paymentMethod: value === 'all' ? null : value as PaymentMethod })
  }

  const handleDateFromChange = (value: string) => {
    onFilterChange({ dateFrom: value || null })
  }

  const handleDateToChange = (value: string) => {
    onFilterChange({ dateTo: value || null })
  }

  const removeFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case 'status':
        if (value) {
          const newStatuses = selectedStatuses.filter(s => s !== value)
          setSelectedStatuses(newStatuses)
          onFilterChange({ status: newStatuses })
        }
        break
      case 'orderType':
        onFilterChange({ orderType: null })
        break
      case 'paymentMethod':
        onFilterChange({ paymentMethod: null })
        break
      case 'search':
        onFilterChange({ search: '' })
        break
      case 'dateFrom':
        onFilterChange({ dateFrom: null })
        break
      case 'dateTo':
        onFilterChange({ dateTo: null })
        break
    }
  }

  const activeFiltersCount = [
    filters.status.length > 0,
    filters.orderType,
    filters.paymentMethod,
    filters.search.trim(),
    filters.dateFrom,
    filters.dateTo
  ].filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by order number, customer name, or phone..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilter('search')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <div className="space-y-2">
              {Object.values(OrderStatus).map(status => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusChange(status)}
                    className="rounded border-gray-300"
                  />
                  <OrderStatusBadge status={status} size="sm" />
                </label>
              ))}
            </div>
          </div>

          {/* Order Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Order Type</label>
            <Select 
              value={filters.orderType || 'all'} 
              onValueChange={handleOrderTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={OrderType.DINE_IN}>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4" />
                    Dine In
                  </div>
                </SelectItem>
                <SelectItem value={OrderType.DELIVERY}>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Payment Method</label>
            <Select 
              value={filters.paymentMethod || 'all'} 
              onValueChange={handlePaymentMethodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value={PaymentMethod.CASH}>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value={PaymentMethod.ONLINE}>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Online
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date Range</label>
            <div className="space-y-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="pl-10"
                  placeholder="From date"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  className="pl-10"
                  placeholder="To date"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Active Filters ({activeFiltersCount})
              </span>
              <Button variant="outline" size="sm" onClick={onReset}>
                Clear All
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Status Badges */}
              {filters.status.map(status => (
                <Badge key={status} variant="secondary" className="flex items-center gap-1">
                  <OrderStatusBadge status={status as OrderStatus} size="sm" showIcon={false} />
                  <button
                    onClick={() => removeFilter('status', status)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}

              {/* Order Type Badge */}
              {filters.orderType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.orderType === OrderType.DINE_IN ? (
                    <>
                      <UtensilsCrossed className="w-3 h-3" />
                      Dine In
                    </>
                  ) : (
                    <>
                      <Truck className="w-3 h-3" />
                      Delivery
                    </>
                  )}
                  <button
                    onClick={() => removeFilter('orderType')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {/* Payment Method Badge */}
              {filters.paymentMethod && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.paymentMethod === PaymentMethod.CASH ? (
                    <>
                      <Banknote className="w-3 h-3" />
                      Cash
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3 h-3" />
                      Online
                    </>
                  )}
                  <button
                    onClick={() => removeFilter('paymentMethod')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {/* Search Badge */}
              {filters.search.trim() && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  &quot;{filters.search}&quot;
                  <button
                    onClick={() => removeFilter('search')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {/* Date Range Badges */}
              {filters.dateFrom && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  From: {filters.dateFrom}
                  <button
                    onClick={() => removeFilter('dateFrom')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {filters.dateTo && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  To: {filters.dateTo}
                  <button
                    onClick={() => removeFilter('dateTo')}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}