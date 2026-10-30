//src/modules/list/list.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { listController } from './list.controller.js'
import { createListSchema, listIdSchema, updateListSchema, moveListSchema, listListsSchema } from './list.validation.js'

const router = express.Router({ mergeParams: true })
router.use(authenticate)

router.post('/', validation(createListSchema), asyncHandler(listController.create))
router.get('/', validation(listListsSchema), asyncHandler(listController.list))
router.patch('/:listId', validation(updateListSchema), asyncHandler(listController.update))
router.patch('/:listId/move', validation(moveListSchema), asyncHandler(listController.move))
router.delete('/:listId', validation(listIdSchema), asyncHandler(listController.remove))

export default router