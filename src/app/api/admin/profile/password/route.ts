import { NextRequest } from 'next/server'
export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const validatedData = updatePasswordSchema.parse(body)

    // Get admin with current password
    const admin = await prisma.admin.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true }
    })

    if (!admin) {
      return errorResponse('Admin not found', 404)
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(validatedData.currentPassword, admin.password)
    if (!isValidPassword) {
      return errorResponse('Current password is incorrect', 400)
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10)

    // Update password
    await prisma.admin.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return successResponse(null, 'Password updated successfully')

  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.errors[0].message, 400)
    }
    return handleApiError(error)
  }
}

