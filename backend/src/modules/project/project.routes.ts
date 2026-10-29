//src/modules/project/project.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { projectController } from './project.controller.js'
import { createProjectSchema, updateProjectSchema, projectIdSchema } from './project.validation.js'

const router = express.Router()
router.use(authenticate)

router.post('/', validation(createProjectSchema), asyncHandler(projectController.create))
router.get('/', asyncHandler(projectController.list))
router.get('/:projectId', validation(projectIdSchema), asyncHandler(projectController.get))
router.patch('/:projectId', validation(updateProjectSchema), asyncHandler(projectController.update))
router.delete('/:projectId', validation(projectIdSchema), asyncHandler(projectController.remove))

export default router