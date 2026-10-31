//src/modules/chat/chat.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { chatController } from './chat.controller.js'
import { deleteMessageSchema, listMessagesSchema, sendMessageSchema } from './chat.validation.js'

// mounted at /api/projects/:projectId/tasks/:taskId/messages
const router = express.Router({ mergeParams: true })

router.get('/', authenticate, validation(listMessagesSchema), asyncHandler(chatController.list))
router.post('/', authenticate, validation(sendMessageSchema), asyncHandler(chatController.send))
router.delete('/:messageId', authenticate, validation(deleteMessageSchema), asyncHandler(chatController.remove))

export default router