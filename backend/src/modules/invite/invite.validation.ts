//src/modules/invite/invite.validation.ts
import { z } from 'zod'

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id')
const project = { projectId: objectId }

export const createInviteSchema = z.object({
  params: z.object(project).strict(),
  body: z.object({
    role: z.enum(['editor', 'viewer']),
    expiresInDays: z.number().int().min(1).max(30).default(7),
    maxUses: z.number().int().min(1).max(50).default(10),
  }).strict(),
})
export const projectScopeSchema = z.object({ params: z.object(project).strict() })
export const inviteIdSchema = z.object({ params: z.object({ ...project, inviteId: objectId }).strict() })
export const memberIdSchema = z.object({ params: z.object({ ...project, userId: objectId }).strict() })
export const updateMemberSchema = z.object({
  params: z.object({ ...project, userId: objectId }).strict(),
  body: z.object({ role: z.enum(['editor', 'viewer']) }).strict(),
})
export const acceptInviteSchema = z.object({
  body: z.object({ token: z.string().regex(/^[0-9a-f]{64}$/, 'Invalid invite') }).strict(),
})