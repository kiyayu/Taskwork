//src/modules/attachment/attachment.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { attachmentService } from './attachment.service.js'
import type { AttachmentParamsDTO, CreateAttachmentDTO, TaskScopeDTO } from './attachment.dto.js'

export const attachmentController = {
  create: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskScopeDTO
    const data = await attachmentService.create(req.user!.id, projectId, taskId, req.data?.body as CreateAttachmentDTO)
    return sendSuccess({ res, data, message: 'Attachment added', statusCode: 201 })
  },
  list: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskScopeDTO
    const data = await attachmentService.list(req.user!.id, projectId, taskId)
    return sendSuccess({ res, data, message: 'Attachments retrieved' })
  },
  remove: async (req: Request, res: Response) => {
    const { projectId, taskId, attachmentId } = req.data?.params as AttachmentParamsDTO
    await attachmentService.remove(req.user!.id, projectId, taskId, attachmentId)
    return sendSuccess({ res, message: 'Attachment deleted' })
  },
}