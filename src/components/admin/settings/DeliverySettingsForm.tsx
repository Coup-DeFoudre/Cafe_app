'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { DeliverySettingsSchema, type DeliverySettingsInput } from '@/lib/validations/settings'

interface DeliverySettingsFormProps {
  settings: {
    deliveryEnabled?: boolean
    deliveryCharge?: number
    minOrderValue?: number
  }
  onSuccess: (data: any) => void
}

export function DeliverySettingsForm({ settings, onSuccess }: DeliverySettingsFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<DeliverySettingsInput>({
    resolver: zodResolver(DeliverySettingsSchema),
    defaultValues: {
      deliveryEnabled: settings.deliveryEnabled ?? false,
      deliveryCharge: settings.deliveryCharge ?? 0,
      minOrderValue: settings.minOrderValue ?? 0,
    },
  })

  const deliveryEnabled = form.watch('deliveryEnabled')

  const onSubmit = (formData: DeliverySettingsInput) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'delivery', ...formData }),
        })

        if (!response.ok) {
          throw new Error('Failed to update delivery settings')
        }

        const { data } = await response.json()
        onSuccess(data)
        toast.success('Delivery settings updated successfully')
      } catch (error) {
        toast.error('Failed to update delivery settings')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="deliveryEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Delivery</FormLabel>
                <FormDescription>
                  Enable delivery option for customers
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

        {deliveryEnabled && (
          <>
            <FormField
              control={form.control}
              name="deliveryCharge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Charge</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Flat delivery charge per order
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minOrderValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Order Value</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₹
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="pl-8"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Minimum order value required for delivery
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
