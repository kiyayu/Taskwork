//src/lib/env.ts
import { z } from 'zod'

const schema = z.object({
  VITE_API_BASE_URL: z
  .string()
  .refine((v) => v.startsWith('/') || /^https?:\/\//.test(v), 'VITE_API_BASE_URL must be a full URL or start with /'),
  VITE_DEFAULT_LANG: z.string().min(2).default('en'),
  // optional: when both are set, a "Try demo" button appears
  VITE_DEMO_EMAIL: z.string().optional(),
  VITE_DEMO_PASSWORD: z.string().optional(),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  const details = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n')
  throw new Error(`Invalid environment configuration:\n${details}`)
}

export const env = {
  apiBaseUrl: parsed.data.VITE_API_BASE_URL.replace(/\/?$/, '/'),
  defaultLang: parsed.data.VITE_DEFAULT_LANG,
  demoEmail: parsed.data.VITE_DEMO_EMAIL,
  demoPassword: parsed.data.VITE_DEMO_PASSWORD,
}