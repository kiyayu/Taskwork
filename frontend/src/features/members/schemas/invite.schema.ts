//src/features/members/schemas/invite.schema.ts
import { z } from 'zod'

// Selects work with strings; converted to numbers on submit.
export const inviteSchema = z.object({
  role: z.enum(['editor', 'viewer']),
  expiresInDays: z.enum(['1', '7', '30']),
  maxUses: z.enum(['1', '5', '10', '50']),
})

export type InviteFormValues = z.infer<typeof inviteSchema>