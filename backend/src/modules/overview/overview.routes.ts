//src/modules/overview/overview.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { overviewService } from './overview.service.js'
import type { Request, Response } from 'express'

const router = express.Router()
router.use(authenticate)
router.get('/overview', asyncHandler(async (req: Request, res: Response) =>
  sendSuccess({ res, data: await overviewService.get(req.user!.id), message: 'Overview retrieved' })
))
export default router