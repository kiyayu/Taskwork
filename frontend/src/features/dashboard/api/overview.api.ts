//src/features/dashboard/api/overview.api.ts
import { api } from '@/lib/axios'
import type { Overview } from '../types'

export const overviewApi = {
  get: async (): Promise<Overview> => {
    const res = await api.get<{ data: Overview }>('/me/overview')
    return res.data.data
  },
}