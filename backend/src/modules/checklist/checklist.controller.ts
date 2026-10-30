//src/modules/checklist/checklist.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { checklistService } from './checklist.service.js'
import type { CreateItemDTO, ItemParamsDTO, MoveItemDTO, TaskScopeDTO, UpdateItemDTO } from './checklist.dto.js'

export const checklistController = {
  list: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskScopeDTO
    const data = await checklistService.list(req.user!.id, projectId, taskId)
    return sendSuccess({ res, data, message: 'Checklist retrieved' })
  },
  create: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskScopeDTO
    const data = await checklistService.create(req.user!.id, projectId, taskId, req.data?.body as CreateItemDTO)
    return sendSuccess({ res, data, message: 'Item added', statusCode: 201 })
  },
  update: async (req: Request, res: Response) => {
    const { projectId, taskId, itemId } = req.data?.params as ItemParamsDTO
    const data = await checklistService.update(req.user!.id, projectId, taskId, itemId, req.data?.body as UpdateItemDTO)
    return sendSuccess({ res, data, message: 'Item updated' })
  },
  move: async (req: Request, res: Response) => {
    const { projectId, taskId, itemId } = req.data?.params as ItemParamsDTO
    const data = await checklistService.move(req.user!.id, projectId, taskId, itemId, req.data?.body as MoveItemDTO)
    return sendSuccess({ res, data, message: 'Item moved' })
  },
  remove: async (req: Request, res: Response) => {
    const { projectId, taskId, itemId } = req.data?.params as ItemParamsDTO
    const data = await checklistService.remove(req.user!.id, projectId, taskId, itemId)
    return sendSuccess({ res, data, message: 'Item deleted' })
  },
}