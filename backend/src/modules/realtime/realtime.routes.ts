//src/modules/realtime/realtime.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { z } from 'zod'
import { realtimeController } from './realtime.controller.js'

const streamSchema = z.object({
  params: z.object({ projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id') }).strict(),
})

const router = express.Router({ mergeParams: true })
router.get('/', authenticate, validation(streamSchema), asyncHandler(realtimeController.stream))
export default router