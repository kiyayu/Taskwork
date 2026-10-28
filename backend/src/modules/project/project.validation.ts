//src/modules/project/project.validation.ts
import { z } from 'zod'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')

export const createProjectSchema = z.object({
  body: z.object({ name: z.string().trim().min(1).max(100) }).strict(),
})

export const updateProjectSchema = z.object({
  params: z.object({ projectId: objectId }).strict(),
  body: z.object({ name: z.string().trim().min(1).max(100) }).strict(),
})

export const projectIdSchema = z.object({
  params: z.object({ projectId: objectId }).strict(),
})