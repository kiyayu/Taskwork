//src/modules/activity/activity.validation.ts
import { z } from 'zod'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')

export const listActivitySchema = z.object({
  params: z.object({ projectId: objectId }).strict(),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).optional(),
    before: z.string().datetime().transform((v) => new Date(v)).optional(),
    taskId: objectId.optional(),
  }).strict(),
})