import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

/**
 * Fetch cafe with all settings
 */
export async function getCafeWithSettings(cafeId: string) {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id: cafeId },
      include: {
        settings: true,
      },
    })

    return cafe
  } catch (error) {
    console.error('Error fetching cafe with settings:', error)
    return null
  }
}

/**
 * Update cafe information fields
 */
export async function updateCafeInfo(
  cafeId: string,
  data: {
    name?: string
    tagline?: string | null
    description?: string | null
    phone?: string | null
    email?: string | null
    address?: string | null
  }
) {
  try {
    const updatedCafe = await prisma.cafe.update({
      where: { id: cafeId },
      data,
    })

    return updatedCafe
  } catch (error) {
    console.error('Error updating cafe info:', error)
    throw error
  }
}

/**
 * Update cafe branding (logo and banner)
 */
export async function updateCafeBranding(
  cafeId: string,
  data: {
    logo?: string | null
    bannerImage?: string | null
  }
) {
  try {
    const updatedCafe = await prisma.cafe.update({
      where: { id: cafeId },
      data,
    })

    return updatedCafe
  } catch (error) {
    console.error('Error updating cafe branding:', error)
    throw error
  }
}

/**
 * Update business hours
 */
export async function updateBusinessHours(
  cafeId: string,
  businessHours: Prisma.InputJsonValue
) {
  try {
    const updatedCafe = await prisma.cafe.update({
      where: { id: cafeId },
      data: { businessHours },
    })

    return updatedCafe
  } catch (error) {
    console.error('Error updating business hours:', error)
    throw error
  }
}

/**
 * Update social links
 */
export async function updateSocialLinks(
  cafeId: string,
  socialLinks: Prisma.InputJsonValue
) {
  try {
    const updatedCafe = await prisma.cafe.update({
      where: { id: cafeId },
      data: { socialLinks },
    })

    return updatedCafe
  } catch (error) {
    console.error('Error updating social links:', error)
    throw error
  }
}

/**
 * Update theme colors
 */
export async function updateThemeColors(
  cafeId: string,
  themeColors: Prisma.InputJsonValue
) {
  try {
    const updatedCafe = await prisma.cafe.update({
      where: { id: cafeId },
      data: { themeColors },
    })

    return updatedCafe
  } catch (error) {
    console.error('Error updating theme colors:', error)
    throw error
  }
}

/**
 * Update settings (upsert to create if doesn't exist)
 */
export async function updateSettings(
  cafeId: string,
  data: {
    deliveryEnabled?: boolean
    deliveryCharge?: number
    minOrderValue?: number
    taxRate?: number
    taxEnabled?: boolean
    onlinePaymentEnabled?: boolean
    paymentQrCode?: string | null
    upiId?: string | null
  }
) {
  try {
    const updatedSettings = await prisma.settings.upsert({
      where: { cafeId },
      create: {
        cafeId,
        ...data,
      },
      update: data,
    })

    return updatedSettings
  } catch (error) {
    console.error('Error updating settings:', error)
    throw error
  }
}
