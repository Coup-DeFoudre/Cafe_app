'use client'

import { useTransition, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { CafeInfoSchema, type CafeInfoInput } from '@/lib/validations/settings'

interface CafeInfoFormProps {
  cafe: {
    name: string
    tagline?: string | null
    description?: string | null
    phone?: string | null
    email?: string | null
    address?: string | null
  }
  onSuccess: (data: any) => void
}

export function CafeInfoForm({ cafe, onSuccess }: CafeInfoFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CafeInfoInput>({
    resolver: zodResolver(CafeInfoSchema),
    defaultValues: {
      name: cafe.name || '',
      tagline: cafe.tagline || '',
      description: cafe.description || '',
      phone: cafe.phone || '',
      email: cafe.email || '',
      address: cafe.address || '',
    },
  })

  // Re-sync form when cafe props change
  useEffect(() => {
    form.reset({
      name: cafe.name || '',
      tagline: cafe.tagline || '',
      description: cafe.description || '',
      phone: cafe.phone || '',
      email: cafe.email || '',
      address: cafe.address || '',
    })
  }, [cafe, form])

  const onSubmit = (formData: CafeInfoInput) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'cafeInfo', ...formData }),
        })

        if (!response.ok) {
          throw new Error('Failed to update cafe information')
        }

        const { data } = await response.json()
        onSuccess(data)
        toast.success('Cafe information updated successfully')
      } catch (error) {
        toast.error('Failed to update cafe information')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cafe Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter cafe name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your cafe's tagline"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell customers about your cafe"
                  {...field}
                  value={field.value || ''}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91 1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="cafe@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your cafe's address"
                  {...field}
                  value={field.value || ''}
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  )
}
