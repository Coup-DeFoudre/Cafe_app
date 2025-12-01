import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface UseImageUploadProps {
  initialUrl?: string | null
  maxSizeMB?: number
}

interface UseImageUploadReturn {
  file: File | null
  preview: string | null
  isUploading: boolean
  handleFileSelect: (file: File) => void
  handleRemove: () => void
  uploadToCloudinary: () => Promise<string | null>
  resetToInitial: () => void
}

export function useImageUpload({ 
  initialUrl = null, 
  maxSizeMB = 5 
}: UseImageUploadProps = {}): UseImageUploadReturn {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initialUrl)
  const [isObjectUrl, setIsObjectUrl] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Update preview when initialUrl changes
  useEffect(() => {
    if (initialUrl && !file) {
      setPreview(initialUrl)
      setIsObjectUrl(false)
    }
  }, [initialUrl, file])

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (isObjectUrl && preview) {
        URL.revokeObjectURL(preview)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be less than ${maxSizeMB}MB`)
      return
    }

    // Revoke previous object URL if it exists
    if (isObjectUrl && preview) {
      URL.revokeObjectURL(preview)
    }

    setFile(selectedFile)
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)
    setIsObjectUrl(true)
  }

  const handleRemove = () => {
    if (isObjectUrl && preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(initialUrl)
    setIsObjectUrl(false)
  }

  const uploadToCloudinary = async (): Promise<string | null> => {
    if (!file) return null

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const { data } = await response.json()
      
      // Revoke object URL and update preview with Cloudinary URL
      if (isObjectUrl && preview) {
        URL.revokeObjectURL(preview)
      }
      
      setFile(null)
      setPreview(data.url)
      setIsObjectUrl(false)
      
      return data.url
    } catch (error) {
      toast.error('Failed to upload image')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const resetToInitial = () => {
    if (isObjectUrl && preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(initialUrl)
    setIsObjectUrl(false)
  }

  return {
    file,
    preview,
    isUploading,
    handleFileSelect,
    handleRemove,
    uploadToCloudinary,
    resetToInitial,
  }
}
