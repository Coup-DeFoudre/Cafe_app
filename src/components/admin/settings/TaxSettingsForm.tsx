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
import { TaxSettingsSchema, type TaxSettingsInput } from '@/lib/validations/settings'

interface TaxSettingsFormProps {
  settings: {
    taxEnabled?: boolean
    taxRate?: number
  }
  onSuccess: (data: any) => void
}

export function TaxSettingsForm({ settings, onSuccess }: TaxSettingsFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<TaxSettingsInput>({
    resolver: zodResolver(TaxSettingsSchema),
    defaultValues: {
      taxEnabled: settings.taxEnabled ?? false,
      taxRate: settings.taxRate ?? 0,
    },
  })

  const taxEnabled = form.watch('taxEnabled')

  const onSubmit = (formData: TaxSettingsInput) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'tax', ...formData }),
        })

        if (!response.ok) {
          throw new Error('Failed to update tax settings')
        }

        const { data } = await response.json()
        onSuccess(data)
        toast.success('Tax settings updated successfully')
      } catch (error) {
        toast.error('Failed to update tax settings')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="taxEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Tax</FormLabel>
                <FormDescription>
                  Enable tax calculation on orders
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

        {taxEnabled && (
          <FormField
            control={form.control}
            name="taxRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Rate (%)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="0"
                      className="pr-8"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  </div>
                </FormControl>
                <FormDescription>
                  Tax percentage to apply on orders (e.g., 5 for 5% GST)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
