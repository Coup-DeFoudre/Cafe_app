import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdminSession } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { ReorderSchema } from '@/lib/validations/menu'
import { prisma } from '@/lib/prisma'
import { z, ZodError } from 'zod'

const CategoryReorderSchema = z.object({
  categoryId: z.string(),
  items: z.array(z.object({
    id: z.string(),
    order: z.number()
  }))
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId

    const body = await request.json()
    const validatedData = CategoryReorderSchema.parse(body)

    const itemIds = validatedData.items.map(item => item.id)

    // Verify all item IDs belong to this cafe AND the specified category
    const items = await prisma.menuItem.findMany({
      where: { 
        id: { in: itemIds }, 
        cafeId,
        categoryId: validatedData.categoryId
      }
    })

    if (items.length !== itemIds.length) {
      return errorResponse('Invalid item IDs or items do not belong to the specified category', 400)
    }

    // Update all items atomically
    await prisma.$transaction(
      validatedData.items.map(item =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    )

    return successResponse(null, 'Menu items reordered successfully')
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(JSON.stringify(error.issues), 400)
    }
    return handleApiError(error)
  }
}