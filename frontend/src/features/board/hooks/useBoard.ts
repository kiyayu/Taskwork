//src/features/board/hooks/useBoard.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { boardApi, type CreateTaskInput } from '../api/board.api'

export const boardKeys = {
  all: (projectId: string) => ['board', projectId] as const,
  lists: (projectId: string) => ['board', projectId, 'lists'] as const,
  tasks: (projectId: string) => ['board', projectId, 'tasks'] as const,
}

export const useLists = (projectId: string) =>
  useQuery({ queryKey: boardKeys.lists(projectId), queryFn: () => boardApi.lists(projectId), enabled: !!projectId })

export const useTasks = (projectId: string) =>
  useQuery({ queryKey: boardKeys.tasks(projectId), queryFn: () => boardApi.tasks(projectId), enabled: !!projectId })

// Data work in the hooks: any change refreshes the whole board prefix of that project.
export const useCreateList = (projectId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => boardApi.createList({ projectId, name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.all(projectId) }),
  })
}

export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => boardApi.createTask({ projectId, ...input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.all(projectId) }),
  })
}