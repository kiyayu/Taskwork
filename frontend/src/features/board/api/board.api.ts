//src/features/board/api/board.api.ts
import { api } from '@/lib/axios'
import type { BoardList, BoardTask } from '../types/board.types'

export type CreateTaskInput = {
  title: string
  description?: string
  listId: string
  priority: 1 | 2 | 3
}

export type UpdateTaskInput = {
  title: string
  description: string
  priority: 1 | 2 | 3
  assigneeId: string | null
  dueDate: string | null
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

  updateTask: async (input: { projectId: string; taskId: string } & UpdateTaskInput): Promise<BoardTask> => {
    const { projectId, taskId, ...body } = input
    const res = await api.patch<{ data: BoardTask }>(`/projects/${projectId}/tasks/${taskId}`, body)
    return res.data.data
  },

  moveTask: async (input: {
    projectId: string; taskId: string; listId: string; aboveId: string | null; belowId: string | null
  }): Promise<void> => {
    const { projectId, taskId, ...body } = input
    await api.patch(`/projects/${projectId}/tasks/${taskId}/move`, body)
  },

  archiveTask: async (input: { projectId: string; taskId: string }): Promise<void> => {
    await api.post(`/projects/${input.projectId}/tasks/${input.taskId}/archive`)
  },

  deleteTask: async (input: { projectId: string; taskId: string }): Promise<void> => {
    await api.delete(`/projects/${input.projectId}/tasks/${input.taskId}`)
  },
}