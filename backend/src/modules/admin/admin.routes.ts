//src/modules/admin/admin.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { requireRole } from '../../common/middlewares/requireRole.js'
import { validation } from '../../common/middlewares/validation.js'
import { adminController } from './admin.controller.js'
import { adminListUsersSchema, adminUpdateUserSchema } from './admin.validation.js'

const router = express.Router()
router.use(authenticate, requireRole(['admin'])) // every admin route: logged in AND admin

router.get('/stats', asyncHandler(adminController.stats))
router.get('/users', validation(adminListUsersSchema), asyncHandler(adminController.listUsers))
router.patch('/users/:userId', validation(adminUpdateUserSchema), asyncHandler(adminController.updateUser))

export default router