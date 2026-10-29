//src/modules/task/task.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { taskService } from './task.service.js'
import type {
  CreateTaskDTO, ListTasksQueryDTO, MoveTaskDTO, ProjectParamsDTO, TaskParamsDTO, UpdateTaskDTO,
} from './task.dto.js'

export const taskController = {
  create: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectParamsDTO
    const body = req.data?.body as CreateTaskDTO
    const data = await taskService.create(req.user!.id, projectId, body)
    return sendSuccess({ res, data, message: 'Task created', statusCode: 201 })
  },

  list: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectParamsDTO
    const query = (req.data?.query ?? {}) as ListTasksQueryDTO
    const data = await taskService.list(req.user!.id, projectId, query)
    return sendSuccess({ res, data, message: 'Tasks retrieved' })
  },

  get: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskParamsDTO
    const data = await taskService.get(req.user!.id, projectId, taskId)
    return sendSuccess({ res, data, message: 'Task retrieved' })
  },

  update: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskParamsDTO
    const body = req.data?.body as UpdateTaskDTO
    const data = await taskService.update(req.user!.id, projectId, taskId, body)
    return sendSuccess({ res, data, message: 'Task updated' })
  },

  move: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskParamsDTO
    const body = req.data?.body as MoveTaskDTO
    const data = await taskService.move(req.user!.id, projectId, taskId, body)
    return sendSuccess({ res, data, message: 'Task moved' })
  },

  archive: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskParamsDTO
    const data = await taskService.archive(req.user!.id, projectId, taskId)
    return sendSuccess({ res, data, message: 'Task archived' })
  },

  restore: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskParamsDTO
    const data = await taskService.restore(req.user!.id, projectId, taskId)
    return sendSuccess({ res, data, message: 'Task restored' })
  },

  remove: async (req: Request, res: Response) => {
    const { projectId, taskId } = req.data?.params as TaskParamsDTO
    await taskService.remove(req.user!.id, projectId, taskId)
    return sendSuccess({ res, message: 'Task deleted' })
  },
}