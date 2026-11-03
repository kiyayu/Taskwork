//src/features/activity/api/activity.api.ts
import { api } from '@/lib/axios'
import type { ActivityPage } from '../types'

export const activityApi = {
  list: async (input: { projectId: string; before?: string }): Promise<ActivityPage> => {
    const res = await api.get<{ data: ActivityPage }>(`/projects/${input.projectId}/activity`, {
      params: { limit: 20, ...(input.before ? { before: input.before } : {}) },
    })
    return res.data.data
  },
}