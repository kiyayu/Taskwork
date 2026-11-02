//src/features/board/hooks/useBoard.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { boardApi, type CreateTaskInput, type UpdateTaskInput } from '../api/board.api'
import type { BoardTask } from '../types/board.types'
import type { Drop } from '../utils/computeDrop'
import { computeOrder } from '../utils/order'

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
const useInvalidateBoard = (projectId: string) => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: boardKeys.all(projectId) })
}

export const useCreateList = (projectId: string) => {
  const invalidate = useInvalidateBoard(projectId)
  return useMutation({
    mutationFn: (name: string) => boardApi.createList({ projectId, name }),
    onSuccess: invalidate,
  })
}

export const useCreateTask = (projectId: string) => {
  const invalidate = useInvalidateBoard(projectId)
  return useMutation({
    mutationFn: (input: CreateTaskInput) => boardApi.createTask({ projectId, ...input }),
    onSuccess: invalidate,
  })
}

export const useUpdateTask = (projectId: string) => {
  const invalidate = useInvalidateBoard(projectId)
  return useMutation({
    mutationFn: (input: { taskId: string } & UpdateTaskInput) => boardApi.updateTask({ projectId, ...input }),
    onSuccess: invalidate,
  })
}

export const useArchiveTask = (projectId: string) => {
  const invalidate = useInvalidateBoard(projectId)
  return useMutation({
    mutationFn: (taskId: string) => boardApi.archiveTask({ projectId, taskId }),
    onSuccess: invalidate,
  })
}

export const useDeleteTask = (projectId: string) => {
  const invalidate = useInvalidateBoard(projectId)
  return useMutation({
    mutationFn: (taskId: string) => boardApi.deleteTask({ projectId, taskId }),
    onSettled: invalidate, // a 404 (already deleted elsewhere) must still re-sync
  })
}

export const useMoveTask = (projectId: string) => {
  const queryClient = useQueryClient()
  const key = boardKeys.tasks(projectId)

  return useMutation({
    mutationFn: (drop: Drop) => boardApi.moveTask({ projectId, ...drop }),

    onMutate: async (drop) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<BoardTask[]>(key)
      if (previous) {
        const orderOf = (id: string | null) => (id ? previous.find((t) => t.id === id)?.order : null)
        const order = computeOrder(orderOf(drop.aboveId), orderOf(drop.belowId))
        queryClient.setQueryData<BoardTask[]>(
          key,
          previous.map((t) => (t.id === drop.taskId ? { ...t, listId: drop.listId, order } : t))
        )
      }
      return { previous }
    },

    onError: (_error, _drop, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: boardKeys.all(projectId) }),
  })
}