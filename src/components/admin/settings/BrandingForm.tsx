'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useImageUpload } from '@/hooks/useImageUpload'

interface BrandingFormProps {
  cafe: {
    logo?: string | null
    bannerImage?: string | null
  }
  onSuccess: (data: any) => void
}

export function BrandingForm({ cafe, onSuccess }: BrandingFormProps) {
  const [isPending, startTransition] = useTransition()

  const logo = useImageUpload({ initialUrl: cafe.logo, maxSizeMB: 5 })
  const banner = useImageUpload({ initialUrl: cafe.bannerImage, maxSizeMB: 5 })

  const handleLogoUpload = async () => {
    startTransition(async () => {
      const url = await logo.uploadToCloudinary()
      if (!url) return

      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'branding', logo: url }),
        })

        if (!response.ok) {
          throw new Error('Failed to update logo')
        }

        const { data } = await response.json()
        onSuccess(data)
        toast.success('Logo updated successfully')
      } catch (error) {
        toast.error('Failed to update logo')
      }
    })
  }

  const handleLogoRemove = async () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'branding', logo: null }),
        })

        if (!response.ok) {
          throw new Error('Failed to remove logo')
        }

        const { data } = await response.json()
        logo.handleRemove()
        onSuccess(data)
        toast.success('Logo removed successfully')
      } catch (error) {
        toast.error('Failed to remove logo')
      }
    })
  }

  const handleBannerUpload = async () => {
    startTransition(async () => {
      const url = await banner.uploadToCloudinary()
      if (!url) return

      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'branding', bannerImage: url }),
        })

        if (!response.ok) {
          throw new Error('Failed to update banner')
        }

        const { data } = await response.json()
        onSuccess(data)
        toast.success('Banner updated successfully')
      } catch (error) {
        toast.error('Failed to update banner')
      }
    })
  }

  const handleBannerRemove = async () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'branding', bannerImage: null }),
        })

        if (!response.ok) {
          throw new Error('Failed to remove banner')
        }

        const { data } = await response.json()
        banner.handleRemove()
        onSuccess(data)
        toast.success('Banner removed successfully')
      } catch (error) {
        toast.error('Failed to remove banner')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>
            Upload your cafe logo (max 200x200px recommended, max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logo.preview ? (
            <div className="space-y-4">
              <div className="relative w-48 h-48 rounded-lg overflow-hidden border">
                <Image
                  src={logo.preview}
                  alt="Logo preview"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex gap-2">
                {logo.file ? (
                  <>
                    <Button
                      onClick={handleLogoUpload}
                      disabled={logo.isUploading || isPending}
                    >
                      {logo.isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Save Logo'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={logo.handleRemove}
                      disabled={logo.isUploading || isPending}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={handleLogoRemove}
                    disabled={isPending}
                  >
                    Remove Logo
                  </Button>
                )}
              }
            </div>
          ) : (
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </div>
              <div className="text-xs text-gray-500">PNG, JPG up to 5MB</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) logo.handleFileSelect(file)
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banner Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Banner Image</CardTitle>
          <CardDescription>
            Upload your cafe banner image (16:9 aspect ratio recommended, max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {banner.preview ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                <Image
                  src={banner.preview}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex gap-2">
                {banner.file ? (
                  <>
                    <Button
                      onClick={handleBannerUpload}
                      disabled={banner.isUploading || isPending}
                    >
                      {banner.isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Save Banner'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={banner.handleRemove}
                      disabled={banner.isUploading || isPending}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={handleBannerRemove}
                    disabled={isPending}
                  >
                    Remove Banner
                  </Button>
                )}
              }
            </div>
          ) : (
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-sm text-gray-600 mb-2">
                Click to upload or drag and drop
              </div>
              <div className="text-xs text-gray-500">PNG, JPG up to 5MB</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) banner.handleFileSelect(file)
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
