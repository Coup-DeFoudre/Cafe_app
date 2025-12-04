import { getServerSession } from 'next-auth/next'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import ProfilePageClient from '@/components/admin/profile/ProfilePageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile | Cafe Admin',
  description: 'Manage your admin profile'
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/admin/login')
  }

  // Fetch admin details
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
    redirect('/admin/login')
  }

  return (
    <ProfilePageClient 
      admin={{
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt.toISOString(),
        cafeName: admin.cafe.name,
        cafeLogo: admin.cafe.logo,
      }} 
    />
  )
}

