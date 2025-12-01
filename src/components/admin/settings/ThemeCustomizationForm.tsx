'use client'

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ThemeColorsSchema, type ThemeColorsInput } from '@/lib/validations/settings'

interface ThemeCustomizationFormProps {
  themeColors: any
  onSuccess: (data: any) => void
}

const DEFAULT_THEME = {
  primary: '#1e293b',
  secondary: '#fbbf24',
  accent: '#3b82f6',
}

export function ThemeCustomizationForm({ themeColors, onSuccess }: ThemeCustomizationFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ThemeColorsInput>({
    resolver: zodResolver(ThemeColorsSchema),
    defaultValues: {
      primary: themeColors?.primary || DEFAULT_THEME.primary,
      secondary: themeColors?.secondary || DEFAULT_THEME.secondary,
      accent: themeColors?.accent || DEFAULT_THEME.accent,
    },
  })

  // Sync color picker and hex input bidirectionally
  const primaryColor = form.watch('primary')
  const secondaryColor = form.watch('secondary')
  const accentColor = form.watch('accent')

  const onSubmit = (formData: ThemeColorsInput) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'themeColors', themeColors: formData }),
        })

        if (!response.ok) {
          throw new Error('Failed to update theme colors')
        }

        const { data } = await response.json()
        onSuccess(data)
        toast.success('Theme colors updated successfully')
      } catch (error) {
        toast.error('Failed to update theme colors')
      }
    })
  }

  const handleResetToDefaults = () => {
    form.setValue('primary', DEFAULT_THEME.primary)
    form.setValue('secondary', DEFAULT_THEME.secondary)
    form.setValue('accent', DEFAULT_THEME.accent)
    toast.info('Theme reset to defaults')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Primary Color</CardTitle>
            <CardDescription>
              Main brand color used for headers and primary actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="primary"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <FormLabel>Color Picker</FormLabel>
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          className="h-12 cursor-pointer"
                        />
                      </FormControl>
                    </div>
                    <div>
                      <FormLabel>Hex Value</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="#1e293b"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                    </div>
                    <div>
                      <FormLabel>Preview</FormLabel>
                      <div
                        className="h-12 rounded-md border"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secondary Color</CardTitle>
            <CardDescription>
              Accent color for highlights and secondary elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="secondary"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <FormLabel>Color Picker</FormLabel>
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          className="h-12 cursor-pointer"
                        />
                      </FormControl>
                    </div>
                    <div>
                      <FormLabel>Hex Value</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="#fbbf24"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                    </div>
                    <div>
                      <FormLabel>Preview</FormLabel>
                      <div
                        className="h-12 rounded-md border"
                        style={{ backgroundColor: secondaryColor }}
                      />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accent Color (Optional)</CardTitle>
            <CardDescription>
              Optional accent color for special elements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="accent"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <FormLabel>Color Picker</FormLabel>
                      <FormControl>
                        <Input
                          type="color"
                          {...field}
                          value={field.value || DEFAULT_THEME.accent}
                          className="h-12 cursor-pointer"
                        />
                      </FormControl>
                    </div>
                    <div>
                      <FormLabel>Hex Value</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="#3b82f6"
                          {...field}
                          value={field.value || ''}
                          className="font-mono"
                        />
                      </FormControl>
                    </div>
                    <div>
                      <FormLabel>Preview</FormLabel>
                      <div
                        className="h-12 rounded-md border"
                        style={{ backgroundColor: accentColor || DEFAULT_THEME.accent }}
                      />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleResetToDefaults}
            disabled={isPending}
          >
            Reset to Defaults
          </Button>
        </div>
      </form>
    </Form>
  )
}
