//src/features/board/hooks/useBoard.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { boardApi, type CreateTaskInput } from '../api/board.api'
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

export const useMoveTask = (projectId: string) => {
  const queryClient = useQueryClient()
  const key = boardKeys.tasks(projectId)

  return useMutation({
    mutationFn: (drop: Drop) => boardApi.moveTask({ projectId, ...drop }),

    // 1. stop in-flight refetches from overwriting our edit, 2. snapshot, 3. edit the cache now
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

    // failure: put the snapshot back
    onError: (_error, _drop, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },

    // always: let the server's truth replace our guess
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardKeys.all(projectId) }),
  })
}