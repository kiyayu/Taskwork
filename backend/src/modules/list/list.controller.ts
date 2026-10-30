//src/modules/list/list.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { listService } from './list.service.js'
import type { CreateListDTO, ListParamsDTO, MoveListDTO, ProjectScopeDTO, UpdateListDTO } from './list.dto.js'

export const listController = {
  create: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectScopeDTO
    const data = await listService.create(req.user!.id, projectId, req.data?.body as CreateListDTO)
    return sendSuccess({ res, data, message: 'List created', statusCode: 201 })
  },
  list: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectScopeDTO
    return sendSuccess({ res, data: await listService.list(req.user!.id, projectId), message: 'Lists retrieved' })
  },
  update: async (req: Request, res: Response) => {
    const { projectId, listId } = req.data?.params as ListParamsDTO
    const data = await listService.update(req.user!.id, projectId, listId, req.data?.body as UpdateListDTO)
    return sendSuccess({ res, data, message: 'List updated' })
  },
  move: async (req: Request, res: Response) => {
    const { projectId, listId } = req.data?.params as ListParamsDTO
    const data = await listService.move(req.user!.id, projectId, listId, req.data?.body as MoveListDTO)
    return sendSuccess({ res, data, message: 'List moved' })
  },
  remove: async (req: Request, res: Response) => {
    const { projectId, listId } = req.data?.params as ListParamsDTO
    await listService.remove(req.user!.id, projectId, listId)
    return sendSuccess({ res, message: 'List deleted' })
  },
}