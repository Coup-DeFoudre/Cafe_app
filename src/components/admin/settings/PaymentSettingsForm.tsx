'use client'

import { useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { PaymentSettingsSchema, type PaymentSettingsInput } from '@/lib/validations/settings'
import { useImageUpload } from '@/hooks/useImageUpload'

interface PaymentSettingsFormProps {
  settings: {
    onlinePaymentEnabled?: boolean
    paymentQrCode?: string | null
    upiId?: string | null
  }
  onSuccess: (data: any) => void
}

export function PaymentSettingsForm({ settings, onSuccess }: PaymentSettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const qr = useImageUpload({ initialUrl: settings.paymentQrCode, maxSizeMB: 2 })

  const form = useForm<PaymentSettingsInput>({
    resolver: zodResolver(PaymentSettingsSchema),
    defaultValues: {
      onlinePaymentEnabled: settings.onlinePaymentEnabled ?? false,
      paymentQrCode: settings.paymentQrCode || '',
      upiId: settings.upiId || '',
    },
  })

  const onlinePaymentEnabled = form.watch('onlinePaymentEnabled')

  const handleQrUpload = async () => {
    startTransition(async () => {
      const url = await qr.uploadToCloudinary()
      if (!url) return

      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'payment',
            onlinePaymentEnabled: form.getValues('onlinePaymentEnabled'),
            paymentQrCode: url,
            upiId: form.getValues('upiId'),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update payment settings')
        }

        const { data } = await response.json()
        onSuccess(data)
        form.setValue('paymentQrCode', url)
        toast.success('QR code uploaded and saved successfully')
      } catch (error) {
        toast.error('Failed to upload QR code')
      }
    })
  }

  const onSubmit = (formData: PaymentSettingsInput) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'payment', ...formData }),
        })

        if (!response.ok) {
          throw new Error('Failed to update payment settings')
        }

        const { data } = await response.json()
        onSuccess(data)
        toast.success('Payment settings updated successfully')
      } catch (error) {
        toast.error('Failed to update payment settings')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="onlinePaymentEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Online Payment</FormLabel>
                <FormDescription>
                  Allow customers to pay online via UPI
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {onlinePaymentEnabled && (
          <>
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="yourname@paytm"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your UPI ID for payments (e.g., yourname@paytm)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card>
              <CardHeader>
                <CardTitle>Payment QR Code</CardTitle>
                <CardDescription>
                  Upload a QR code for UPI payments (max 300x300px recommended, max 2MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {qr.preview ? (
                  <div className="space-y-4">
                    <div className="relative w-64 h-64 rounded-lg overflow-hidden border">
                      <Image
                        src={qr.preview}
                        alt="QR code preview"
                        fill
                        className="object-contain"
                      />
                      {qr.file && (
                        <button
                          type="button"
                          onClick={qr.handleRemove}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {qr.file && (
                      <Button
                        type="button"
                        onClick={handleQrUpload}
                        disabled={qr.isUploading || isPending}
                      >
                        {qr.isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Upload QR Code'
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">PNG, JPG up to 2MB</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) qr.handleFileSelect(file)
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Button type="submit" disabled={isPending || qr.isUploading}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
