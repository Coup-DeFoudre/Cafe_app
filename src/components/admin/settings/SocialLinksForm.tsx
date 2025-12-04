'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { Facebook, Instagram, Twitter, MessageCircle, Globe } from 'lucide-react'
import { SocialLinksSchema, type SocialLinksInput } from '@/lib/validations/settings'

interface SocialLinksFormProps {
  socialLinks: any
  onSuccess: (data: any) => void
}

export function SocialLinksForm({ socialLinks, onSuccess }: SocialLinksFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<SocialLinksInput>({
    resolver: zodResolver(SocialLinksSchema),
    defaultValues: {
      facebook: socialLinks?.facebook || '',
      instagram: socialLinks?.instagram || '',
      twitter: socialLinks?.twitter || '',
      x: socialLinks?.x || '',
      whatsapp: socialLinks?.whatsapp || '',
      website: socialLinks?.website || '',
    },
  })

  const onSubmit = (formData: SocialLinksInput) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'socialLinks', socialLinks: formData }),
        })

        if (!response.ok) {
          throw new Error('Failed to update social links')
        }

        const { data } = await response.json()
        onSuccess(data)
        toast.success('Social links updated successfully')
      } catch (error) {
        toast.error('Failed to update social links')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Facebook className="w-4 h-4" />
                Facebook
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://facebook.com/yourcafe"
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
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Instagram className="w-4 h-4" />
                Instagram
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://instagram.com/yourcafe"
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
          name="twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://twitter.com/yourcafe"
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
          name="x"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                X (formerly Twitter)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://x.com/yourcafe"
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
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://wa.me/1234567890"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                WhatsApp link (e.g., https://wa.me/1234567890)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://yourcafe.com"
                  {...field}
                  value={field.value || ''}
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
