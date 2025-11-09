import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { ReorderSchema } from '@/lib/validations/menu'
import { prisma } from '@/lib/prisma'
import { ZodError } from 'zod'

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId

    const body = await request.json()
    const validatedData = ReorderSchema.parse(body)

    // Update order for each category
    await Promise.all(
      validatedData.items.map(async (item) => {
        await prisma.menuCategory.update({
          where: { 
            id: item.id,
            cafeId // Ensure cafe ownership
          },
          data: { order: item.order }
        })
      })
    )

    return successResponse(null, 'Categories reordered successfully')
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(JSON.stringify(error.issues), 400)
    }
    return handleApiError(error)
  }
}