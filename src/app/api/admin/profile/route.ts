import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        cafe: {
          select: {
            name: true,
            logo: true,
          }
        }
      }
    })

    if (!admin) {
      return errorResponse('Admin not found', 404)
    }

    return successResponse({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
      cafeName: admin.cafe.name,
      cafeLogo: admin.cafe.logo,
    })

  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const updatedAdmin = await prisma.admin.update({
      where: { id: session.user.id },
      data: { name: validatedData.name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    })

    return successResponse(updatedAdmin, 'Profile updated successfully')

  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400)
    }
    return handleApiError(error)
  }
}

