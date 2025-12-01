'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CafeInfoForm } from './CafeInfoForm'
import { BrandingForm } from './BrandingForm'
import { BusinessHoursForm } from './BusinessHoursForm'
import { SocialLinksForm } from './SocialLinksForm'
import { PaymentSettingsForm } from './PaymentSettingsForm'
import { DeliverySettingsForm } from './DeliverySettingsForm'
import { TaxSettingsForm } from './TaxSettingsForm'
import { ThemeCustomizationForm } from './ThemeCustomizationForm'
import type { CafeWithSettings } from '@/types'

interface SettingsPageClientProps {
  initialCafe: CafeWithSettings
  initialSettings: NonNullable<CafeWithSettings['settings']>
}

export function SettingsPageClient({ initialCafe, initialSettings }: SettingsPageClientProps) {
  const [cafe, setCafe] = useState<CafeWithSettings>(initialCafe)
  const [settings, setSettings] = useState<NonNullable<CafeWithSettings['settings']>>(initialSettings)

  const handleCafeUpdate = (updatedCafe: CafeWithSettings) => {
    setCafe(updatedCafe)
  }

  const handleSettingsUpdate = (updatedSettings: NonNullable<CafeWithSettings['settings']>) => {
    setSettings(updatedSettings)
  }

  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="branding">Branding</TabsTrigger>
        <TabsTrigger value="hours">Hours</TabsTrigger>
        <TabsTrigger value="social">Social</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
        <TabsTrigger value="delivery">Delivery</TabsTrigger>
        <TabsTrigger value="theme">Theme</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <Card className="p-6">
          <CafeInfoForm cafe={cafe} onSuccess={handleCafeUpdate} />
        </Card>
      </TabsContent>

      <TabsContent value="branding" className="space-y-6">
        <BrandingForm cafe={cafe} onSuccess={handleCafeUpdate} />
      </TabsContent>

      <TabsContent value="hours" className="space-y-6">
        <Card className="p-6">
          <BusinessHoursForm
            businessHours={cafe.businessHours || {}}
            onSuccess={handleCafeUpdate}
          />
        </Card>
      </TabsContent>

      <TabsContent value="social" className="space-y-6">
        <Card className="p-6">
          <SocialLinksForm
            socialLinks={cafe.socialLinks || {}}
            onSuccess={handleCafeUpdate}
          />
        </Card>
      </TabsContent>

      <TabsContent value="payment" className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
          <PaymentSettingsForm settings={settings} onSuccess={handleSettingsUpdate} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tax Settings</h3>
          <TaxSettingsForm settings={settings} onSuccess={handleSettingsUpdate} />
        </Card>
      </TabsContent>

      <TabsContent value="delivery" className="space-y-6">
        <Card className="p-6">
          <DeliverySettingsForm settings={settings} onSuccess={handleSettingsUpdate} />
        </Card>
      </TabsContent>

      <TabsContent value="theme" className="space-y-6">
        <ThemeCustomizationForm
          themeColors={cafe.themeColors || {}}
          onSuccess={handleCafeUpdate}
        />
      </TabsContent>
    </Tabs>
  )
}
