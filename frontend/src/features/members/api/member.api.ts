//src/features/members/api/member.api.ts
import { api } from '@/lib/axios'
import type { CreatedInvite, Invite, InviteRole, Member } from '../types/member.types'

export const memberApi = {
  list: async (projectId: string): Promise<Member[]> => {
    const res = await api.get<{ data: Member[] }>(`/projects/${projectId}/members`)
    return res.data.data ?? []
  },

  updateRole: async (input: { projectId: string; userId: string; role: InviteRole }): Promise<void> => {
    await api.patch(`/projects/${input.projectId}/members/${input.userId}`, { role: input.role })
  },

  remove: async (input: { projectId: string; userId: string }): Promise<void> => {
    await api.delete(`/projects/${input.projectId}/members/${input.userId}`)
  },

  invites: async (projectId: string): Promise<Invite[]> => {
    const res = await api.get<{ data: Invite[] }>(`/projects/${projectId}/invites`)
    return res.data.data ?? []
  },

  createInvite: async (input: {
    projectId: string; role: InviteRole; expiresInDays: number; maxUses: number
  }): Promise<CreatedInvite> => {
    const { projectId, ...body } = input
    const res = await api.post<{ data: CreatedInvite }>(`/projects/${projectId}/invites`, body)
    return res.data.data
  },

  revokeInvite: async (input: { projectId: string; inviteId: string }): Promise<void> => {
    await api.delete(`/projects/${input.projectId}/invites/${input.inviteId}`)
  },

  accept: async (token: string): Promise<{ projectId: string; role: string }> => {
    const res = await api.post<{ data: { projectId: string; role: string } }>('/invites/accept', { token })
    return res.data.data
  },
}