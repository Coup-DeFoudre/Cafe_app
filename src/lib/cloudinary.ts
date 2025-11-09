import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function uploadImage(file: Buffer | string, options: { mimeType?: string } & object = {}): Promise<any> {
  const defaultOptions = {
    folder: 'cafe-menu-images',
    resource_type: 'image' as const,
    transformation: [
      {
        width: 800,
        height: 800,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }
    ]
  }

  const mergedOptions = { ...defaultOptions, ...options }
  // Remove mimeType from mergedOptions since it's not a Cloudinary option
  const { mimeType, ...cloudinaryOptions } = mergedOptions as { mimeType?: string } & object

  try {
    let result
    if (Buffer.isBuffer(file)) {
      // Safely handle buffer conversion with error checking
      if (file.length === 0) {
        throw new Error('Empty buffer provided')
      }
      // Convert buffer to base64 data URL for Cloudinary with provided MIME type
      const actualMimeType = mimeType ?? 'image/jpeg' // Use provided MIME type or fallback
      const base64String = `data:${actualMimeType};base64,${file.toString('base64')}`
      result = await cloudinary.uploader.upload(base64String, cloudinaryOptions)
    } else if (typeof file === 'string') {
      // Handle string input (URL or base64)
      result = await cloudinary.uploader.upload(file, cloudinaryOptions)
    } else {
      throw new Error('Invalid file input type. Expected Buffer or string.')
    }
    return result
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload image to Cloudinary')
  }
}

export async function deleteImage(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete image from Cloudinary')
  }
}

export function getOptimizedUrl(publicId: string, width?: number, height?: number): string {
  const transformations: any = {}
  
  if (width) transformations.width = width
  if (height) transformations.height = height
  if (width || height) transformations.crop = 'limit'

  return cloudinary.url(publicId, transformations)
}

export { cloudinary }