//src/modules/comment/comment.validation.ts
import { z } from 'zod'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')
const taskParams = { projectId: objectId, taskId: objectId }

export const createCommentSchema = z.object({
  params: z.object(taskParams).strict(),
  body: z.object({
    text: z.string().trim().min(1).max(2000),
    mentions: z.array(objectId).max(20).optional(),
  }).strict(),
})

export const listCommentsSchema = z.object({
  params: z.object(taskParams).strict(),
})

export const commentIdSchema = z.object({
  params: z.object({ ...taskParams, commentId: objectId }).strict(),
})