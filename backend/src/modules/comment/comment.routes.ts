//src/modules/comment/comment.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { commentController } from './comment.controller.js'
import { createCommentSchema, listCommentsSchema, commentIdSchema } from './comment.validation.js'

const router = express.Router({ mergeParams: true })
router.use(authenticate)

router.post('/', validation(createCommentSchema), asyncHandler(commentController.create))
router.get('/', validation(listCommentsSchema), asyncHandler(commentController.list))
router.delete('/:commentId', validation(commentIdSchema), asyncHandler(commentController.remove))

export default router