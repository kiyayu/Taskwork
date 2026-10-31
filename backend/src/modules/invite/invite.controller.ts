//src/modules/invite/invite.controller.ts
import { Request, Response } from 'express'
import { sendSuccess } from '../../common/handlers/responseHandler.js'
import { inviteService } from './invite.service.js'
import type {
  AcceptInviteDTO, CreateInviteDTO, InviteParamsDTO, MemberParamsDTO, ProjectScopeDTO, UpdateMemberDTO,
} from './invite.dto.js'

export const inviteController = {
  create: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectScopeDTO
    const data = await inviteService.create(req.user!.id, projectId, req.data?.body as CreateInviteDTO)
    return sendSuccess({ res, data, message: 'Invite created', statusCode: 201 })
  },
  listInvites: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectScopeDTO
    return sendSuccess({ res, data: await inviteService.listInvites(req.user!.id, projectId), message: 'Invites retrieved' })
  },
  revoke: async (req: Request, res: Response) => {
    const { projectId, inviteId } = req.data?.params as InviteParamsDTO
    await inviteService.revoke(req.user!.id, projectId, inviteId)
    return sendSuccess({ res, message: 'Invite revoked' })
  },
  accept: async (req: Request, res: Response) => {
    const { token } = req.data?.body as AcceptInviteDTO
    return sendSuccess({ res, data: await inviteService.accept(req.user!.id, token), message: 'Joined project' })
  },
  listMembers: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as ProjectScopeDTO
    return sendSuccess({ res, data: await inviteService.listMembers(req.user!.id, projectId), message: 'Members retrieved' })
  },
  updateRole: async (req: Request, res: Response) => {
    const { projectId, userId } = req.data?.params as MemberParamsDTO
    await inviteService.updateRole(req.user!.id, projectId, userId, (req.data?.body as UpdateMemberDTO).role)
    return sendSuccess({ res, message: 'Role updated' })
  },
  removeMember: async (req: Request, res: Response) => {
    const { projectId, userId } = req.data?.params as MemberParamsDTO
    await inviteService.removeMember(req.user!.id, projectId, userId)
    return sendSuccess({ res, message: 'Member removed' })
  },
}