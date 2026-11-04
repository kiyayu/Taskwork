//src/modules/admin/admin.validation.ts
import { z } from 'zod'
import { PLANS } from '../project/project.constants.js'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')

export const adminListUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    search: z.string().trim().max(100).optional(),
  }).strict(),
})

export const adminUpdateUserSchema = z.object({
  params: z.object({ userId: objectId }).strict(),
  body: z
    .object({ plan: z.enum(PLANS).optional(), isActive: z.boolean().optional() })
    .strict()
    .refine((b) => b.plan !== undefined || b.isActive !== undefined, { message: 'Nothing to update' }),
})