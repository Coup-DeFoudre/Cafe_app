import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      cafeId: string
      role: string
      email: string
      name: string
    } & DefaultSession['user']
  }
  interface User {
    id: string
    cafeId: string
    role: string
    email: string
    name: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    cafeId: string
    role: string
    email: string
    name: string
  }
}