//src/modules/task/task.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { taskController } from './task.controller.js'
import {
  createTaskSchema, listTasksSchema, taskIdSchema, updateTaskSchema, moveTaskSchema,
} from './task.validation.js'

// mergeParams: this router is mounted under /projects/:projectId, so it can read projectId
const router = express.Router({ mergeParams: true })
router.use(authenticate)

router.post('/', validation(createTaskSchema), asyncHandler(taskController.create))
router.get('/', validation(listTasksSchema), asyncHandler(taskController.list))
router.get('/:taskId', validation(taskIdSchema), asyncHandler(taskController.get))
router.patch('/:taskId', validation(updateTaskSchema), asyncHandler(taskController.update))
router.patch('/:taskId/move', validation(moveTaskSchema), asyncHandler(taskController.move))
router.post('/:taskId/archive', validation(taskIdSchema), asyncHandler(taskController.archive))
router.post('/:taskId/restore', validation(taskIdSchema), asyncHandler(taskController.restore))
router.delete('/:taskId', validation(taskIdSchema), asyncHandler(taskController.remove))

export default router