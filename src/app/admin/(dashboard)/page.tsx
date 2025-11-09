import { Suspense } from 'react'
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp 
} from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import { getDashboardStats, getRecentOrders } from '@/lib/queries/dashboard'
import { requireAdminSession } from '@/lib/auth'
import { formatCurrency } from '@/lib/utils'

async function DashboardStats() {
  const session = await requireAdminSession()
  const stats = await getDashboardStats(session.user.cafeId)
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Today's Revenue"
        value={formatCurrency(stats.todayRevenue)}
        icon={DollarSign}
        description="Revenue for today"
      />
      <StatsCard
        title="Total Orders"
        value={stats.totalOrders}
        icon={ShoppingBag}
        description="All time orders"
      />
      <StatsCard
        title="Pending Orders"
        value={stats.pendingOrders}
        icon={TrendingUp}
        description="Orders to process"
      />
      <StatsCard
        title="Total Customers"
        value={stats.totalCustomers}
        icon={Users}
        description="Registered customers"
      />
    </div>
  )
}

async function RecentOrdersList() {
  const session = await requireAdminSession()
  const recentOrders = await getRecentOrders(session.user.cafeId)
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
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
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(order.total)}</p>
                <p className="text-sm text-slate-600 capitalize">{order.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function LoadingStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-slate-200 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  )
}

function LoadingOrders() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="h-6 bg-slate-200 rounded w-1/4 mb-4 animate-pulse"></div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-lg animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome back! Here&apos;s what&apos;s happening at your cafe.
        </p>
      </div>

      <Suspense fallback={<LoadingStats />}>
        <DashboardStats />
      </Suspense>

      <Suspense fallback={<LoadingOrders />}>
        <RecentOrdersList />
      </Suspense>
    </div>
  )
}