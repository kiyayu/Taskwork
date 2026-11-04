//src/features/admin/api/admin.api.ts
import { api } from '@/lib/axios'
import type { AdminStats, AdminUser, AdminUsersPage, Plan } from '../types'

export const adminApi = {
  stats: async (): Promise<AdminStats> => {
    const res = await api.get<{ data: AdminStats }>('/admin/stats')
    return res.data.data
  },

  users: async (query: { page: number; search: string }): Promise<AdminUsersPage> => {
    const res = await api.get<{ data: AdminUser[]; pagination: AdminUsersPage['pagination'] }>('/admin/users', {
      params: { page: query.page, limit: 15, ...(query.search ? { search: query.search } : {}) },
    })
    return { items: res.data.data ?? [], pagination: res.data.pagination }
  },

  updateUser: async (input: { userId: string; plan?: Plan; isActive?: boolean }): Promise<AdminUser> => {
    const { userId, ...body } = input
    const res = await api.patch<{ data: AdminUser }>(`/admin/users/${userId}`, body)
    return res.data.data
  },
}