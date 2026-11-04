//src/modules/admin/admin.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { adminService } from './admin.service.js'
import type { Plan } from '../project/project.constants.js'

export const adminController = {
  stats: async (_req: Request, res: Response) =>
    sendSuccess({ res, data: await adminService.stats(), message: 'Stats retrieved' }),

  listUsers: async (req: Request, res: Response) => {
    const query = (req.data?.query ?? {}) as { page?: number; limit?: number; search?: string }
    const { items, pagination } = await adminService.listUsers(query)
    return sendSuccess({ res, data: items, pagination, message: 'Users retrieved' })
  },

  updateUser: async (req: Request, res: Response) => {
    const { userId } = req.data?.params as { userId: string }
    const body = req.data?.body as { plan?: Plan; isActive?: boolean }
    const data = await adminService.updateUser(req.user!.id, userId, body)
    return sendSuccess({ res, data, message: 'User updated' })
  },
}