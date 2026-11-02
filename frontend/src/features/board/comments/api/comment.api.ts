//src/features/board/comments/api/comment.api.ts
import { api } from '@/lib/axios'
import type { TaskComment } from '../types'

type Scope = { projectId: string; taskId: string }
const base = ({ projectId, taskId }: Scope) => `/projects/${projectId}/tasks/${taskId}/comments`

export const commentApi = {
  list: async (scope: Scope): Promise<TaskComment[]> => {
    const res = await api.get<{ data: TaskComment[] }>(base(scope))
    return res.data.data ?? []
  },

  create: async (input: Scope & { text: string; mentions: string[] }): Promise<TaskComment> => {
    const { text, mentions } = input
    const res = await api.post<{ data: TaskComment }>(base(input), { text, mentions })
    return res.data.data
  },

  remove: async (input: Scope & { commentId: string }): Promise<void> => {
    await api.delete(`${base(input)}/${input.commentId}`)
  },
}