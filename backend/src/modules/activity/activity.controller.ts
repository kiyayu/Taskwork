//src/modules/activity/activity.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { activityService } from './activity.service.js'

export const activityController = {
  list: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as { projectId: string }
    const query = (req.data?.query ?? {}) as { limit?: number; before?: Date; taskId?: string }
    const data = await activityService.list(req.user!.id, projectId, query)
    return sendSuccess({ res, data, message: 'Activity retrieved' })
  },
}