'use client'

import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'
import { NotificationsProvider } from '@/contexts/NotificationsContext'

interface SessionProviderWrapperProps {
  children: React.ReactNode
  session: Session | null
}

export default function SessionProviderWrapper({ children, session }: SessionProviderWrapperProps) {
  return (
    <SessionProvider session={session}>
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </SessionProvider>
  )
}
