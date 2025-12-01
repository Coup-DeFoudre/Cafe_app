import { getServerSession } from 'next-auth/next'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import { getCafeWithSettings } from '@/lib/queries/settings'
import DashboardHeader from '@/components/admin/DashboardHeader'
import { SettingsPageClient } from '@/components/admin/settings/SettingsPageClient'
import type { CafeWithSettings } from '@/types'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  const cafeId = session.user.cafeId
  const cafeWithSettings = await getCafeWithSettings(cafeId)

  if (!cafeWithSettings) {
    return (
      <div className="space-y-8">
        <DashboardHeader
          title="Settings"
          description="Manage your cafe settings and preferences"
        />
        <div className="text-center text-red-500">
          Cafe not found. Please contact support.
        </div>
      </div>
    )
  }

  // Ensure settings is never null by providing sensible defaults
  const settings = cafeWithSettings.settings || {
    id: '',
    cafeId: cafeWithSettings.id,
    deliveryEnabled: false,
    deliveryCharge: 0,
    minOrderValue: 0,
    taxRate: 0,
    taxEnabled: false,
    onlinePaymentEnabled: false,
    paymentQrCode: null,
    upiId: null,
    currency: 'INR',
    currencySymbol: '₹',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Settings"
        description="Manage your cafe settings and preferences"
      />
      <SettingsPageClient
        initialCafe={cafeWithSettings as CafeWithSettings}
        initialSettings={settings}
      />
    </div>
  )
}
