//src/features/board/checklist/hooks/useChecklist.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { boardKeys } from '../../hooks/useBoard'
import { checklistApi } from '../api/checklist.api'
import type { ChecklistSnapshot } from '../types'

// Starts with the board prefix, so a board-wide invalidation refreshes checklists too.
export const checklistKey = (projectId: string, taskId: string) =>
  ['board', projectId, 'checklist', taskId] as const

export const useChecklist = (projectId: string, taskId: string) =>
  useQuery({
    queryKey: checklistKey(projectId, taskId),
    queryFn: () => checklistApi.list({ projectId, taskId }),
  })

// The server returns the new snapshot: write it straight into the cache (no extra GET),
// then refresh the board cards so their progress bar and counts stay right.
const useSnapshotMutation = <TVars,>(
  projectId: string,
  taskId: string,
  fn: (vars: TVars) => Promise<ChecklistSnapshot>
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (snapshot) => {
      queryClient.setQueryData(checklistKey(projectId, taskId), snapshot)
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(projectId) })
    },
  })
}

export const useAddItem = (projectId: string, taskId: string) =>
  useSnapshotMutation(projectId, taskId, (v: { title: string; parentId: string | null }) =>
    checklistApi.create({ projectId, taskId, ...v })
  )

export const useToggleItem = (projectId: string, taskId: string) =>
  useSnapshotMutation(projectId, taskId, (v: { itemId: string; completed: boolean }) =>
    checklistApi.update({ projectId, taskId, ...v })
  )

export const useRemoveItem = (projectId: string, taskId: string) =>
  useSnapshotMutation(projectId, taskId, (itemId: string) =>
    checklistApi.remove({ projectId, taskId, itemId })
  )