import { z } from 'zod'

// Helper regex for hex color validation
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

// Helper regex for UPI ID validation (name@bank)
const upiIdRegex = /^[\w.-]+@[\w.-]+$/

// Cafe Information Schema
export const CafeInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  tagline: z.string().max(200, 'Tagline must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone must be less than 15 characters'),
  email: z.string().email('Invalid email format'),
  address: z.string().max(500, 'Address must be less than 500 characters').optional(),
})

// Business Hours Schema
const DayHoursSchema = z.object({
  open: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  close: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  closed: z.boolean(),
}).refine(
  (data) => {
    if (data.closed) return true
    const [openHour, openMin] = data.open.split(':').map(Number)
    const [closeHour, closeMin] = data.close.split(':').map(Number)
    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin
    return closeMinutes > openMinutes
  },
  { message: 'Close time must be after open time' }
)

export const BusinessHoursSchema = z.object({
  monday: DayHoursSchema,
  tuesday: DayHoursSchema,
  wednesday: DayHoursSchema,
  thursday: DayHoursSchema,
  friday: DayHoursSchema,
  saturday: DayHoursSchema,
  sunday: DayHoursSchema,
})

// Social Links Schema
export const SocialLinksSchema = z.object({
  facebook: z.string().url('Invalid URL').optional().or(z.literal('')),
  instagram: z.string().url('Invalid URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid URL').optional().or(z.literal('')),
  whatsapp: z.string().url('Invalid URL').optional().or(z.literal('')),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
})

// Theme Colors Schema
export const ThemeColorsSchema = z.object({
  primary: z.string().regex(hexColorRegex, 'Primary color must be a valid hex color (e.g., #1e293b)'),
  secondary: z.string().regex(hexColorRegex, 'Secondary color must be a valid hex color (e.g., #fbbf24)'),
  accent: z.string().regex(hexColorRegex, 'Accent color must be a valid hex color (e.g., #3b82f6)').optional(),
})

// Payment Settings Schema
export const PaymentSettingsSchema = z.object({
  onlinePaymentEnabled: z.boolean(),
  paymentQrCode: z.string().url('Invalid URL').optional().or(z.literal('')),
  upiId: z.string().regex(upiIdRegex, 'Invalid UPI ID format (e.g., name@paytm)').optional().or(z.literal('')),
})

// Delivery Settings Schema
export const DeliverySettingsSchema = z.object({
  deliveryEnabled: z.boolean(),
  deliveryCharge: z.coerce.number().min(0, 'Delivery charge must be 0 or greater'),
  minOrderValue: z.coerce.number().min(0, 'Minimum order value must be 0 or greater'),
})

// Tax Settings Schema
export const TaxSettingsSchema = z.object({
  taxEnabled: z.boolean(),
  taxRate: z.coerce.number().min(0, 'Tax rate must be at least 0').max(100, 'Tax rate must be at most 100'),
})

// General Settings Schema (combines payment, delivery, and tax)
export const GeneralSettingsSchema = PaymentSettingsSchema.merge(DeliverySettingsSchema).merge(TaxSettingsSchema)

// Export TypeScript types
export type CafeInfoInput = z.infer<typeof CafeInfoSchema>
export type BusinessHoursInput = z.infer<typeof BusinessHoursSchema>
export type SocialLinksInput = z.infer<typeof SocialLinksSchema>
export type ThemeColorsInput = z.infer<typeof ThemeColorsSchema>
export type PaymentSettingsInput = z.infer<typeof PaymentSettingsSchema>
export type DeliverySettingsInput = z.infer<typeof DeliverySettingsSchema>
export type TaxSettingsInput = z.infer<typeof TaxSettingsSchema>
export type GeneralSettingsInput = z.infer<typeof GeneralSettingsSchema>
