'use client'

import { useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { BusinessHoursSchema, type BusinessHoursInput } from '@/lib/validations/settings'

interface BusinessHoursFormProps {
  businessHours: any
  onSuccess: (data: any) => void
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

const DEFAULT_HOURS = {
  open: '09:00',
  close: '18:00',
  closed: false,
}

export function BusinessHoursForm({ businessHours, onSuccess }: BusinessHoursFormProps) {
  const [isPending, startTransition] = useTransition()

  // Initialize form with business hours data, providing defaults for missing days
  const getInitialValues = () => DAYS.reduce((acc, day) => {
    acc[day] = businessHours?.[day] || DEFAULT_HOURS
    return acc
  }, {} as BusinessHoursInput)

  const form = useForm<BusinessHoursInput>({
    resolver: zodResolver(BusinessHoursSchema),
    defaultValues: getInitialValues(),
  })

  // Re-sync form when businessHours props change
  useEffect(() => {
    form.reset(getInitialValues())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessHours, form])

  const onSubmit = (formData: BusinessHoursInput) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'businessHours', businessHours: formData }),
        })

        if (!response.ok) {
          throw new Error('Failed to update business hours')
        }

        const { data } = await response.json()
        onSuccess(data)
        toast.success('Business hours updated successfully')
      } catch (error) {
        toast.error('Failed to update business hours')
      }
    })
  }

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {DAYS.map((day) => (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                  {capitalizeFirstLetter(day)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <FormField
                    control={form.control}
                    name={`${day}.closed`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">Closed</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`${day}.open`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            disabled={form.watch(`${day}.closed`)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`${day}.close`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Close Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            disabled={form.watch(`${day}.closed`)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
