//src/features/board/checklist/api/checklist.api.ts
import { api } from '@/lib/axios'
import type { ChecklistSnapshot } from '../types'

const base = (projectId: string, taskId: string) => `/projects/${projectId}/tasks/${taskId}/checklist`

type Scope = { projectId: string; taskId: string }

export const checklistApi = {
  list: async ({ projectId, taskId }: Scope): Promise<ChecklistSnapshot> => {
    const res = await api.get<{ data: ChecklistSnapshot }>(base(projectId, taskId))
    return res.data.data
  },

  create: async ({ projectId, taskId, title, parentId }: Scope & { title: string; parentId: string | null }) => {
    const res = await api.post<{ data: ChecklistSnapshot }>(base(projectId, taskId), { title, parentId })
    return res.data.data
  },

  update: async ({ projectId, taskId, itemId, completed }: Scope & { itemId: string; completed: boolean }) => {
    const res = await api.patch<{ data: ChecklistSnapshot }>(`${base(projectId, taskId)}/${itemId}`, { completed })
    return res.data.data
  },

  remove: async ({ projectId, taskId, itemId }: Scope & { itemId: string }) => {
    const res = await api.delete<{ data: ChecklistSnapshot }>(`${base(projectId, taskId)}/${itemId}`)
    return res.data.data
  },
}