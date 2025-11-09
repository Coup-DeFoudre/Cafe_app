import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import { getDashboardStats, getRecentOrders } from '@/lib/queries/dashboard'
import DashboardHeader from '@/components/admin/DashboardHeader'
import StatsCard from '@/components/admin/StatsCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ShoppingBag, Clock, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  const cafeId = session.user.cafeId
  const stats = await getDashboardStats(cafeId)
  const recentOrders = await getRecentOrders(cafeId, 5)

  return (
    <div className="space-y-8">
      <DashboardHeader 
        title="Dashboard" 
        description="Welcome back! Here's what's happening at your cafe." 
      />
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingBag}
          description="All time orders"
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          description="Orders to process"
        />
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(stats.todayRevenue)}
          icon={DollarSign}
          description="Revenue for today"
        />
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          description="Registered customers"
        />
      </div>

      {/* Order Status Counts */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <Badge variant="destructive" className="mb-1">{stats.statusCounts.PENDING}</Badge>
              <p className="text-xs text-slate-600">Pending</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-1">{stats.statusCounts.CONFIRMED}</Badge>
              <p className="text-xs text-slate-600">Confirmed</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-1 border-orange-500 text-orange-600">{stats.statusCounts.PREPARING}</Badge>
              <p className="text-xs text-slate-600">Preparing</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-1 border-blue-500 text-blue-600">{stats.statusCounts.READY}</Badge>
              <p className="text-xs text-slate-600">Ready</p>
            </div>
            <div className="text-center">
              <Badge variant="default" className="mb-1 bg-green-600">{stats.statusCounts.COMPLETED}</Badge>
              <p className="text-xs text-slate-600">Completed</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-1 border-red-500 text-red-600">{stats.statusCounts.CANCELLED}</Badge>
              <p className="text-xs text-slate-600">Cancelled</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(-8)}</p>
                    <p className="text-sm text-slate-600">
                      {order.customerName} • {order.customer?.email || 'No email'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-semibold">{formatCurrency(order.total)}</p>
                    <Badge variant={order.status === 'PENDING' ? 'destructive' : 'default'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Popular Items */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.popularItems.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No items ordered yet</p>
            ) : (
              stats.popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <Badge variant="secondary">{item.count} orders</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}