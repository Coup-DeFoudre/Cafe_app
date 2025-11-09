import bcryptjs from 'bcryptjs'
import { getServerSession as nextAuthGetServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

export async function hashPassword(password: string): Promise<string> {
  return await bcryptjs.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcryptjs.compare(password, hashedPassword)
}

export { nextAuthGetServerSession as getServerSession }

export async function requireAdminSession() {
  const session = await nextAuthGetServerSession(authOptions)
  
  if (!session) {
    throw new Error('Authentication required')
  }
  
  return session
}