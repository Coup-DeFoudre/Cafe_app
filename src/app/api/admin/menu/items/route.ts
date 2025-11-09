import { NextRequest } from 'next/server'
import { requireAdminSession } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { MenuItemSchema } from '@/lib/validations/menu'
import { prisma } from '@/lib/prisma'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId

    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    // Build filter object
    const filter: any = { cafeId }
    if (categoryId) {
      filter.categoryId = categoryId
    }
    if (search) {
      filter.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const items = await prisma.menuItem.findMany({
      where: filter,
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return successResponse(items)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId

    const body = await request.json()
    const validatedData = MenuItemSchema.parse(body)

    // Verify category exists and belongs to this cafe
    const category = await prisma.menuCategory.findFirst({
      where: { 
        id: validatedData.categoryId, 
        cafeId 
      }
    })

    if (!category) {
      return errorResponse('Category not found', 404)
    }

    // Get highest order value for items in this category
    const maxOrderResult = await prisma.menuItem.aggregate({
      where: { categoryId: validatedData.categoryId },
      _max: { order: true }
    })
    const newOrder = (maxOrderResult._max.order || 0) + 1

    const item = await prisma.menuItem.create({
      data: {
        cafeId,
        categoryId: validatedData.categoryId,
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        image: validatedData.image,
        isAvailable: validatedData.isAvailable ?? true,
        isVeg: validatedData.isVeg ?? true,
        customizations: validatedData.customizations,
        order: newOrder
      }
    })

    return successResponse(item, 'Menu item created successfully')
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(JSON.stringify(error.issues), 400)
    }
    return handleApiError(error)
  }
}