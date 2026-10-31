//src/modules/invite/invite.dto.ts
import { z } from 'zod'
import {
  createInviteSchema, projectScopeSchema, inviteIdSchema, memberIdSchema, updateMemberSchema, acceptInviteSchema,
} from './invite.validation.js'
import type { Role } from '../project/project.permissions.js'

export type CreateInviteDTO = z.infer<typeof createInviteSchema>['body']
export type ProjectScopeDTO = z.infer<typeof projectScopeSchema>['params']
export type InviteParamsDTO = z.infer<typeof inviteIdSchema>['params']
export type MemberParamsDTO = z.infer<typeof memberIdSchema>['params']
export type UpdateMemberDTO = z.infer<typeof updateMemberSchema>['body']
export type AcceptInviteDTO = z.infer<typeof acceptInviteSchema>['body']

export interface MemberDTO { userId: string; name: string; email: string; role: Role }
export interface InviteDTO { id: string; role: string; expiresAt: Date; maxUses: number; uses: number }