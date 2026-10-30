//src/modules/attachment/attachment.dto.ts
import { z } from 'zod'
import { listAttachmentsSchema, createAttachmentSchema, attachmentIdSchema } from './attachment.validation.js'

export type TaskScopeDTO = z.infer<typeof listAttachmentsSchema>['params']
export type CreateAttachmentDTO = z.infer<typeof createAttachmentSchema>['body']
export type AttachmentParamsDTO = z.infer<typeof attachmentIdSchema>['params']

export interface AttachmentResponseDTO {
  id: string; taskId: string; uploaderId: string; uploaderName: string
  name: string; url: string; bytes: number; createdAt: Date
}