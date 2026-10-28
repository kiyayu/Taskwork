//src/modules/project/project.routes.ts
import express from 'express'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { projectController } from './project.controller.js'
import { createProjectSchema, updateProjectSchema, projectIdSchema } from './project.validation.js'

const router = express.Router()
router.use(authenticate)

router.post('/', validation(createProjectSchema), projectController.create)
router.get('/', projectController.list)
router.get('/:projectId', validation(projectIdSchema), projectController.get)
router.patch('/:projectId', validation(updateProjectSchema), projectController.update)
router.delete('/:projectId', validation(projectIdSchema), projectController.remove)

export default router