//src/features/members/api/member.api.ts
import { api } from '@/lib/axios'
import type { Member } from '../types/member.types'

export const memberApi = {
  list: async (projectId: string): Promise<Member[]> => {
    const res = await api.get<{ data: Member[] }>(`/projects/${projectId}/members`)
    return res.data.data ?? []
  },
}