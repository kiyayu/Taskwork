//src/modules/project/project.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { projectService } from './project.service.js'
import type { CreateProjectDTO, ProjectParamsDTO, UpdateProjectDTO } from './project.dto.js'

export const projectController = {
  create: async (req: Request, res: Response) => {
    const { name } = req.data?.body as CreateProjectDTO
    const data = await projectService.create(req.user!.id, name)
    return sendSuccess({ res, data, message: 'Project created', statusCode: 201 })
  },

  list: async (req: Request, res: Response) => {
    const data = await projectService.listMine(req.user!.id)
    return sendSuccess({ res, data, message: 'Projects retrieved' })
  },

  get: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectParamsDTO
    const data = await projectService.get(req.user!.id, projectId)
    return sendSuccess({ res, data, message: 'Project retrieved' })
  },

  update: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectParamsDTO
    const { name } = req.data?.body as UpdateProjectDTO
    const data = await projectService.update(req.user!.id, projectId, name)
    return sendSuccess({ res, data, message: 'Project updated' })
  },

  remove: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectParamsDTO
    await projectService.remove(req.user!.id, projectId)
    return sendSuccess({ res, message: 'Project deleted' })
  },
}