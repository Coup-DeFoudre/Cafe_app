import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-config'
import AdminShell from '@/components/admin/AdminShell'
import SessionProviderWrapper from '@/components/admin/SessionProviderWrapper'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <SessionProviderWrapper session={session}>
      <AdminShell>{children}</AdminShell>
    </SessionProviderWrapper>
  )
}