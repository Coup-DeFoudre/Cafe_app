import { NextRequest } from 'next/server'
// Ensure Vercel build doesn't attempt to prerender this dynamic API route
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdminSession } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { MenuCategorySchema } from '@/lib/validations/menu'
import { prisma } from '@/lib/prisma'
import { ZodError } from 'zod'

interface RouteParams {
  params: {
    categoryId: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId
    const { categoryId } = params

    const body = await request.json()
    const validatedData = MenuCategorySchema.partial().parse(body)

    // Verify category exists and belongs to this cafe
    const existingCategory = await prisma.menuCategory.findFirst({
      where: { 
        id: categoryId, 
        cafeId 
      }
    })

    if (!existingCategory) {
      return errorResponse('Category not found', 404)
    }

    const updatedCategory = await prisma.menuCategory.update({
      where: { id: categoryId },
      data: validatedData
    })

    return successResponse(updatedCategory, 'Category updated successfully')
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(JSON.stringify(error.issues), 400)
    }
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId
    const { categoryId } = params

    // Verify category exists and belongs to this cafe
    const existingCategory = await prisma.menuCategory.findFirst({
      where: { 
        id: categoryId, 
        cafeId 
      }
    })

    if (!existingCategory) {
      return errorResponse('Category not found', 404)
    }

    // Check if category has menu items
    const itemCount = await prisma.menuItem.count({
      where: { categoryId }
    })

    if (itemCount > 0) {
      return errorResponse('Cannot delete category with menu items. Please delete or move items first.', 400)
    }

    // Soft delete by updating isActive
    await prisma.menuCategory.update({
      where: { id: categoryId },
      data: { isActive: false }
    })

    return successResponse(null, 'Category deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}