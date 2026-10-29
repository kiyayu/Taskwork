//src/modules/comment/comment.dto.ts
import { z } from 'zod'
import { createCommentSchema, listCommentsSchema, commentIdSchema } from './comment.validation.js'

export type CreateCommentDTO = z.infer<typeof createCommentSchema>['body']
export type TaskScopeDTO = z.infer<typeof listCommentsSchema>['params']
export type CommentParamsDTO = z.infer<typeof commentIdSchema>['params']

export interface CommentResponseDTO {
  id: string
  taskId: string
  authorId: string
  authorName: string
  text: string
  mentions: string[]
  createdAt: Date
}