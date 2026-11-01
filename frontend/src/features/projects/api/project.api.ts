//src/features/projects/api/project.api.ts
import { api } from '@/lib/axios'
import type { Project } from '../types/project.types'

export const projectApi = {
  list: async (): Promise<Project[]> => {
    const res = await api.get<{ data: Project[] }>('/projects')
    return res.data.data ?? []
  },
  
    get: async (id: string): Promise<Project> => {
    const res = await api.get<{ data: Project }>(`/projects/${id}`)
    return res.data.data
  },

  create: async (name: string): Promise<Project> => {
    const res = await api.post<{ data: Project }>('/projects', { name })
    return res.data.data
  },

  rename: async (input: { id: string; name: string }): Promise<Project> => {
    const res = await api.patch<{ data: Project }>(`/projects/${input.id}`, { name: input.name })
    return res.data.data
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },
}