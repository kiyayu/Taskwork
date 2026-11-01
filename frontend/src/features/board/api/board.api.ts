//src/features/board/api/board.api.ts
import { api } from '@/lib/axios'
import type { BoardList, BoardTask } from '../types/board.types'

export type CreateTaskInput = {
  title: string
  description?: string
  listId: string
  priority: 1 | 2 | 3
}

export const boardApi = {
  lists: async (projectId: string): Promise<BoardList[]> => {
    const res = await api.get<{ data: BoardList[] }>(`/projects/${projectId}/lists`)
    return res.data.data ?? []
  },

  tasks: async (projectId: string): Promise<BoardTask[]> => {
    const res = await api.get<{ data: BoardTask[] }>(`/projects/${projectId}/tasks`)
    return res.data.data ?? []
  },

  createList: async (input: { projectId: string; name: string }): Promise<BoardList> => {
    const res = await api.post<{ data: BoardList }>(`/projects/${input.projectId}/lists`, { name: input.name })
    return res.data.data
  },

  createTask: async (input: { projectId: string } & CreateTaskInput): Promise<BoardTask> => {
    const { projectId, ...body } = input
    const res = await api.post<{ data: BoardTask }>(`/projects/${projectId}/tasks`, body)
    return res.data.data
  },
}