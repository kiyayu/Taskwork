//src/modules/checklist/checklist.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { checklistController } from './checklist.controller.js'
import {
  listChecklistSchema, createItemSchema, itemIdSchema, updateItemSchema, moveItemSchema,
} from './checklist.validation.js'

const router = express.Router({ mergeParams: true })
router.use(authenticate)

router.get('/', validation(listChecklistSchema), asyncHandler(checklistController.list))
router.post('/', validation(createItemSchema), asyncHandler(checklistController.create))
router.patch('/:itemId', validation(updateItemSchema), asyncHandler(checklistController.update))
router.patch('/:itemId/move', validation(moveItemSchema), asyncHandler(checklistController.move))
router.delete('/:itemId', validation(itemIdSchema), asyncHandler(checklistController.remove))

export default router