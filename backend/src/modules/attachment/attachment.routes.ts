//src/modules/attachment/attachment.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { attachmentController } from './attachment.controller.js'
import { listAttachmentsSchema, createAttachmentSchema, attachmentIdSchema } from './attachment.validation.js'

const router = express.Router({ mergeParams: true })
router.use(authenticate)

router.get('/', validation(listAttachmentsSchema), asyncHandler(attachmentController.list))
router.post('/', validation(createAttachmentSchema), asyncHandler(attachmentController.create))
router.delete('/:attachmentId', validation(attachmentIdSchema), asyncHandler(attachmentController.remove))

export default router