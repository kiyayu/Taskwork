//src/modules/chat/chat.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { chatService } from './chat.service.js'
import type { CreateMessageDTO, ListMessagesQueryDTO } from './chat.dto.js'

type TaskParams = { projectId: string; taskId: string }

export const chatController = {
  list: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskParams
    const query = (req.data?.query ?? {}) as ListMessagesQueryDTO
    const data = await chatService.list(req.user!.id, projectId, taskId, query)
    return sendSuccess({ res, data, message: 'Messages retrieved' })
  },
  send: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskParams
    const data = await chatService.send(req.user!.id, projectId, taskId, req.data?.body as CreateMessageDTO)
    return sendSuccess({ res, data, message: 'Message sent', statusCode: 201 })
  },
  remove: async (req: Request, res: Response) => {
    const { projectId, taskId, messageId } = req.data?.params as TaskParams & { messageId: string }
    await chatService.remove(req.user!.id, projectId, taskId, messageId)
    return sendSuccess({ res, message: 'Message deleted' })
  },
}