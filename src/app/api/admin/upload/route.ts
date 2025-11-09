import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession()

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return errorResponse('No file provided', 400)
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.', 400)
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return errorResponse('File too large. Maximum size is 5MB.', 400)
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload using centralized utility with original MIME type
    const result = await uploadImage(buffer, { mimeType: file.type })
    
    return successResponse({ url: result.secure_url }, 'Image uploaded successfully')
  } catch (error) {
    console.error('Upload error:', error)
    return handleApiError(error)
  }
}