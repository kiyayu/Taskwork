//src/modules/checklist/checklist.validation.ts
import { z } from 'zod'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')
const taskParams = { projectId: objectId, taskId: objectId }
const title = z.string().trim().min(1).max(200)

export const listChecklistSchema = z.object({ params: z.object(taskParams).strict() })

export const createItemSchema = z.object({
  params: z.object(taskParams).strict(),
  body: z.object({ title, parentId: objectId.nullable().optional() }).strict(),
})

export const itemIdSchema = z.object({
  params: z.object({ ...taskParams, itemId: objectId }).strict(),
})

export const updateItemSchema = z.object({
  params: z.object({ ...taskParams, itemId: objectId }).strict(),
  body: z.object({ title: title.optional(), completed: z.boolean().optional() }).strict(),
})

export const moveItemSchema = z.object({
  params: z.object({ ...taskParams, itemId: objectId }).strict(),
  body: z.object({
    aboveId: objectId.nullable().optional(),
    belowId: objectId.nullable().optional(),
  }).strict(),
})