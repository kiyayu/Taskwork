//src/features/board/attachments/api/attachment.api.ts
import { api } from '@/lib/axios'
import type { Attachment } from '../types'

type Scope = { projectId: string; taskId: string }
const base = ({ projectId, taskId }: Scope) => `/projects/${projectId}/tasks/${taskId}/attachments`

export const attachmentApi = {
  list: async (scope: Scope): Promise<Attachment[]> => {
    const res = await api.get<{ data: Attachment[] }>(base(scope))
    return res.data.data ?? []
  },

  // only the fileKey is sent: the server confirms the real file against storage and derives the URL
  create: async (input: Scope & { fileKey: string; name: string }): Promise<Attachment> => {
    const res = await api.post<{ data: Attachment }>(base(input), { fileKey: input.fileKey, name: input.name })
    return res.data.data
  },

  remove: async (input: Scope & { attachmentId: string }): Promise<void> => {
    await api.delete(`${base(input)}/${input.attachmentId}`)
  },
}