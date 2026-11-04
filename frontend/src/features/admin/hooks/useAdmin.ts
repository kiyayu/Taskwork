//src/features/admin/hooks/useAdmin.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../api/admin.api'

export const adminKeys = {
  all: ['admin'] as const,
  stats: ['admin', 'stats'] as const,
  users: (query: { page: number; search: string }) => ['admin', 'users', query] as const,
}

export const useAdminStats = () => useQuery({ queryKey: adminKeys.stats, queryFn: adminApi.stats })

export const useAdminUsers = (query: { page: number; search: string }) =>
  useQuery({ queryKey: adminKeys.users(query), queryFn: () => adminApi.users(query), placeholderData: keepPreviousData })

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminApi.updateUser,
    // plan and active counts change too, so refresh the whole admin prefix
    onSettled: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  })
}