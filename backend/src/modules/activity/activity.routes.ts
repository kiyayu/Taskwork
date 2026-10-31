//src/modules/activity/activity.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { activityController } from './activity.controller.js'
import { listActivitySchema } from './activity.validation.js'

const router = express.Router({ mergeParams: true })
router.use(authenticate)
router.get('/', validation(listActivitySchema), asyncHandler(activityController.list))
export default router