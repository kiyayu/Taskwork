//src/features/members/hooks/useMembers.ts
import { useQuery } from '@tanstack/react-query'
import { memberApi } from '../api/member.api'

export const memberKeys = {
  all: (projectId: string) => ['members', projectId] as const,
}

export const useMembers = (projectId: string) =>
  useQuery({
    queryKey: memberKeys.all(projectId),
    queryFn: () => memberApi.list(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60_000, // membership changes rarely
  })