//src/modules/comment/comment.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { commentService } from './comment.service.js'
import type { CommentParamsDTO, CreateCommentDTO, TaskScopeDTO } from './comment.dto.js'

export const commentController = {
  create: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskScopeDTO
    const body = req.data?.body as CreateCommentDTO
    const data = await commentService.create(req.user!.id, projectId, taskId, body)
    return sendSuccess({ res, data, message: 'Comment added', statusCode: 201 })
  },

  list: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskScopeDTO
    const data = await commentService.list(req.user!.id, projectId, taskId)
    return sendSuccess({ res, data, message: 'Comments retrieved' })
  },

  remove: async (req: Request, res: Response) => {
    const { projectId, taskId, commentId } = req.data?.params as CommentParamsDTO
    await commentService.remove(req.user!.id, projectId, taskId, commentId)
    return sendSuccess({ res, message: 'Comment deleted' })
  },
}