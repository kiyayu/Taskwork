//src/modules/invite/invite.routes.ts
import express from 'express'
import { asyncHandler } from '../../common/middlewares/asyncHandler.js'
import { authenticate } from '../../common/middlewares/authMiddleware.js'
import { validation } from '../../common/middlewares/validation.js'
import { createRateLimiter } from '../../common/middlewares/rateLimiter.js'
import { inviteController as c } from './invite.controller.js'
import {
  createInviteSchema, projectScopeSchema, inviteIdSchema, memberIdSchema, updateMemberSchema, acceptInviteSchema,
} from './invite.validation.js'

// project-scoped: mounted at /api/projects/:projectId
export const projectMemberRouter = express.Router({ mergeParams: true })
projectMemberRouter.use(authenticate)
projectMemberRouter.get('/members', validation(projectScopeSchema), asyncHandler(c.listMembers))
projectMemberRouter.patch('/members/:userId', validation(updateMemberSchema), asyncHandler(c.updateRole))
projectMemberRouter.delete('/members/:userId', validation(memberIdSchema), asyncHandler(c.removeMember))
projectMemberRouter.post('/invites', validation(createInviteSchema), asyncHandler(c.create))
projectMemberRouter.get('/invites', validation(projectScopeSchema), asyncHandler(c.listInvites))
projectMemberRouter.delete('/invites/:inviteId', validation(inviteIdSchema), asyncHandler(c.revoke))

// global: mounted at /api/invites. Rate limited: tokens must not be guessable by brute force
export const acceptRouter = express.Router()
const acceptLimiter = createRateLimiter({ windowSeconds: 60, maxRequests: 10, identifier: 'invite-accept' })
acceptRouter.post('/accept', authenticate, acceptLimiter, validation(acceptInviteSchema), asyncHandler(c.accept))