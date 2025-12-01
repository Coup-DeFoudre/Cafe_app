import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdminSession } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { MenuItemSchema } from '@/lib/validations/menu'
import { prisma } from '@/lib/prisma'
import { ZodError } from 'zod'

interface RouteParams {
  params: {
    itemId: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId
    const { itemId } = params

    const body = await request.json()
    const validatedData = MenuItemSchema.partial().parse(body)

    // If categoryId is being changed, verify new category exists and belongs to this cafe
    if (validatedData.categoryId) {
      const category = await prisma.menuCategory.findFirst({
        where: { 
          id: validatedData.categoryId, 
          cafeId 
        }
      })

      if (!category) {
        return errorResponse('Category not found', 404)
      }
    }

    // Verify item exists and belongs to this cafe
    const existingItem = await prisma.menuItem.findFirst({
      where: { 
        id: itemId, 
        cafeId 
      }
    })

    if (!existingItem) {
      return errorResponse('Menu item not found', 404)
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: itemId },
      data: validatedData
    })

    return successResponse(updatedItem, 'Menu item updated successfully')
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
    const { itemId } = params

    // Verify item exists and belongs to this cafe
    const existingItem = await prisma.menuItem.findFirst({
      where: { 
        id: itemId, 
        cafeId 
      }
    })

    if (!existingItem) {
      return errorResponse('Menu item not found', 404)
    }

    await prisma.menuItem.delete({
      where: { id: itemId }
    })

    return successResponse(null, 'Menu item deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}