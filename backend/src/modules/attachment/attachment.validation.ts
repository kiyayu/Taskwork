//src/modules/attachment/attachment.validation.ts
import { z } from 'zod'
import { FILE_KEY_PATTERN } from '../upload/upload.rules.js'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')
const taskParams = { projectId: objectId, taskId: objectId }

export const listAttachmentsSchema = z.object({ params: z.object(taskParams).strict() })

export const createAttachmentSchema = z.object({
  params: z.object(taskParams).strict(),
  body: z.object({
    fileKey: z.string().regex(FILE_KEY_PATTERN, 'Invalid file key'),
    name: z.string().trim().min(1).max(200),
  }).strict(),
})

export const attachmentIdSchema = z.object({
  params: z.object({ ...taskParams, attachmentId: objectId }).strict(),
})