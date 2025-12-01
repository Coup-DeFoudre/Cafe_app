import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith('postgresql://')),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters long'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
})

type Env = z.infer<typeof envSchema>

// Lazy validation - only validate when env is actually accessed at runtime
// This prevents build-time failures when Next.js analyzes modules
let cachedEnv: Env | null = null

function getEnv(): Env {
  if (cachedEnv) return cachedEnv
  
  // Skip validation during build if DATABASE_URL is not set
  // This allows Next.js to analyze routes without failing
  if (!process.env.DATABASE_URL) {
    return process.env as unknown as Env
  }
  
  cachedEnv = envSchema.parse(process.env)
  return cachedEnv
}

// Use a Proxy to lazily validate env on first access
export const env = new Proxy({} as Env, {
  get(_, prop: keyof Env) {
    const envObj = getEnv()
    return envObj[prop]
  }
})
