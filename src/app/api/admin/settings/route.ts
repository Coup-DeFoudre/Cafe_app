import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import {
  getCafeWithSettings,
  updateCafeInfo,
  updateCafeBranding,
  updateBusinessHours,
  updateSocialLinks,
  updateThemeColors,
  updateSettings,
} from '@/lib/queries/settings'
import {
  CafeInfoSchema,
  BusinessHoursSchema,
  SocialLinksSchema,
  ThemeColorsSchema,
  PaymentSettingsSchema,
  DeliverySettingsSchema,
  TaxSettingsSchema,
} from '@/lib/validations/settings'
import { ZodError } from 'zod'

// Helper to normalize empty strings to null for nullable fields
function normalizeEmptyStrings<T extends Record<string, any>>(obj: T): T {
  const normalized = { ...obj }
  for (const key in normalized) {
    if (normalized[key] === '') {
      normalized[key] = null as any
    }
  }
  return normalized
}

export async function GET() {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId

    const cafe = await getCafeWithSettings(cafeId)

    if (!cafe) {
      return errorResponse('Cafe not found', 404)
    }

    return successResponse({ cafe, settings: cafe.settings })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId

    const body = await request.json()
    const { type } = body

    let updatedData: any

    switch (type) {
      case 'cafeInfo': {
        const validatedData = CafeInfoSchema.parse(body)
        updatedData = await updateCafeInfo(cafeId, validatedData)
        break
      }

      case 'branding': {
        const { logo, bannerImage } = body
        updatedData = await updateCafeBranding(cafeId, { logo, bannerImage })
        break
      }

      case 'businessHours': {
        const { businessHours } = body
        const validatedData = BusinessHoursSchema.parse(businessHours)
        updatedData = await updateBusinessHours(cafeId, validatedData)
        break
      }

      case 'socialLinks': {
        const { socialLinks } = body
        const validatedData = SocialLinksSchema.parse(socialLinks)
        const normalizedData = normalizeEmptyStrings(validatedData)
        updatedData = await updateSocialLinks(cafeId, normalizedData)
        break
      }

      case 'themeColors': {
        const { themeColors } = body
        const validatedData = ThemeColorsSchema.parse(themeColors)
        updatedData = await updateThemeColors(cafeId, validatedData)
        break
      }

      case 'payment': {
        const validatedData = PaymentSettingsSchema.parse(body)
        const normalizedData = normalizeEmptyStrings(validatedData)
        updatedData = await updateSettings(cafeId, normalizedData)
        break
      }

      case 'delivery': {
        const validatedData = DeliverySettingsSchema.parse(body)
        updatedData = await updateSettings(cafeId, validatedData)
        break
      }

      case 'tax': {
        const validatedData = TaxSettingsSchema.parse(body)
        updatedData = await updateSettings(cafeId, validatedData)
        break
      }

      default:
        return errorResponse('Invalid update type', 400)
    }

    return successResponse(updatedData, 'Settings updated successfully')
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(JSON.stringify(error.issues), 400)
    }
    return handleApiError(error)
  }
}
