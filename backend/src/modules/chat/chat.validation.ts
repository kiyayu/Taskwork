//src/modules/chat/chat.validation.ts
import { z } from 'zod'

const id = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')

const taskParams = z.object({ projectId: id, taskId: id }).strict()

export const listMessagesSchema = z.object({
  params: taskParams,
  query: z
    .object({
      limit: z.coerce.number().int().min(1).max(50).optional(),
      before: id.optional(),
    })
    .strict(),
})

export const sendMessageSchema = z.object({
  params: taskParams,
  // trimmed first, so a message of only spaces is rejected
  body: z.object({ text: z.string().trim().min(1, 'Message cannot be empty').max(2000) }).strict(),
})

export const deleteMessageSchema = z.object({
  params: z.object({ projectId: id, taskId: id, messageId: id }).strict(),
})