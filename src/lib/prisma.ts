import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization to prevent build-time errors
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['query'],
  })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  
  return client
}

// Export a proxy that lazily initializes the Prisma client
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop: keyof PrismaClient) {
    const client = getPrismaClient()
    const value = client[prop]
    // Bind methods to preserve 'this' context
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  }
})