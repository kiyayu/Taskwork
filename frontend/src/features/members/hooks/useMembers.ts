//src/features/members/hooks/useMembers.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { memberApi } from '../api/member.api'
import type { InviteRole } from '../types/member.types'

export const memberKeys = {
  all: (projectId: string) => ['members', projectId] as const,
  list: (projectId: string) => ['members', projectId, 'list'] as const,
  invites: (projectId: string) => ['members', projectId, 'invites'] as const,
}

export const useMembers = (projectId: string) =>
  useQuery({
    queryKey: memberKeys.list(projectId),
    queryFn: () => memberApi.list(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60_000, // membership changes rarely
  })

// Only the owner may read invites; callers pass enabled=false for everyone else.
export const useInvites = (projectId: string, enabled: boolean) =>
  useQuery({ queryKey: memberKeys.invites(projectId), queryFn: () => memberApi.invites(projectId), enabled: enabled && !!projectId })

// A membership change also changes who can be assigned on the board, so refresh the board's tasks too.
const useRefreshMembers = (projectId: string) => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: memberKeys.all(projectId) }),
      queryClient.invalidateQueries({ queryKey: ['board', projectId, 'tasks'] }),
    ])
}

export const useUpdateRole = (projectId: string) => {
  const refresh = useRefreshMembers(projectId)
  return useMutation({
    mutationFn: (v: { userId: string; role: InviteRole }) => memberApi.updateRole({ projectId, ...v }),
    onSettled: refresh,
  })
}

export const useRemoveMember = (projectId: string) => {
  const refresh = useRefreshMembers(projectId)
  return useMutation({
    mutationFn: (userId: string) => memberApi.remove({ projectId, userId }),
    onSettled: refresh,
  })
}

export const useCreateInvite = (projectId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { role: InviteRole; expiresInDays: number; maxUses: number }) =>
      memberApi.createInvite({ projectId, ...v }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.invites(projectId) }),
  })
}

export const useRevokeInvite = (projectId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inviteId: string) => memberApi.revokeInvite({ projectId, inviteId }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: memberKeys.invites(projectId) }),
  })
}

// Joining changes which projects I have.
export const useAcceptInvite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: memberApi.accept,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })
}