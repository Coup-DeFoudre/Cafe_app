import { z } from 'zod'

export const MenuCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200, 'Description must be less than 200 characters').optional(),
  isActive: z.boolean().optional().default(true)
})

export const MenuItemSchema = z.object({
  categoryId: z.string().cuid('Invalid category ID'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  image: z.union([z.string().url('Invalid image URL'), z.literal('')]).optional(),
  isAvailable: z.boolean().optional().default(true),
  isVeg: z.boolean().optional().default(true),
  customizations: z.record(z.any()).optional()
})

export const ReorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number()
    })
  ).min(1, 'At least one item is required')
})

export type MenuCategoryInput = z.infer<typeof MenuCategorySchema>
export type MenuItemInput = z.infer<typeof MenuItemSchema>
export type ReorderInput = z.infer<typeof ReorderSchema>