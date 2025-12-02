import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { requireAdminSession } from '@/lib/auth'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { MenuCategorySchema } from '@/lib/validations/menu'
import { prisma } from '@/lib/prisma'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Build filter object
    const filter: any = { cafeId }
    if (!includeInactive) {
      filter.isActive = true
    }

    const categories = await prisma.menuCategory.findMany({
      where: filter,
      include: {
        _count: {
          select: {
            menuItems: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return successResponse(categories)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession()
    const cafeId = session.user.cafeId

    const body = await request.json()
    const validatedData = MenuCategorySchema.parse(body)

    // Get highest order value for categories in this cafe
    const maxOrderResult = await prisma.menuCategory.aggregate({
      where: { cafeId },
      _max: { order: true }
    })
    const newOrder = (maxOrderResult._max.order || 0) + 1

    const category = await prisma.menuCategory.create({
      data: {
        cafeId,
        name: validatedData.name,
        description: validatedData.description,
        isActive: validatedData.isActive ?? true,
        order: newOrder
      },
      include: {
        _count: {
          select: {
            menuItems: true
          }
        }
      }
    })

    return successResponse(category, 'Category created successfully')
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(JSON.stringify(error.issues), 400)
    }
    return handleApiError(error)
  }
}

