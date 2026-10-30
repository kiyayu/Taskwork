//src/modules/list/list.validation.ts
import { z } from 'zod'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')
const projectParams = { projectId: objectId }

export const createListSchema = z.object({
  params: z.object(projectParams).strict(),
  body: z.object({ name: z.string().trim().min(1).max(60) }).strict(),
})
export const listIdSchema = z.object({
  params: z.object({ ...projectParams, listId: objectId }).strict(),
})
export const updateListSchema = z.object({
  params: z.object({ ...projectParams, listId: objectId }).strict(),
  body: z.object({ name: z.string().trim().min(1).max(60) }).strict(),
})
export const moveListSchema = z.object({
  params: z.object({ ...projectParams, listId: objectId }).strict(),
  body: z.object({
    aboveId: objectId.nullable().optional(),
    belowId: objectId.nullable().optional(),
  }).strict(),
})
export const listListsSchema = z.object({ params: z.object(projectParams).strict() })