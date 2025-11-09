import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { env } from '@/env'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET })

  // Protect admin routes (but not the login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Redirect authenticated users away from login page
  if (pathname === '/admin/login') {
    if (token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}