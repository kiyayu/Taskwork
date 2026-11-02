//src/features/board/comments/hooks/useComments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { boardKeys } from '../../hooks/useBoard'
import { commentApi } from '../api/comment.api'

// Starts with the board prefix, so a board-wide invalidation refreshes comments too.
export const commentsKey = (projectId: string, taskId: string) =>
  ['board', projectId, 'comments', taskId] as const

export const useComments = (projectId: string, taskId: string) =>
  useQuery({ queryKey: commentsKey(projectId, taskId), queryFn: () => commentApi.list({ projectId, taskId }) })

// A comment changes the list AND the card's comment count, so refresh both.
const useRefresh = (projectId: string, taskId: string) => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: commentsKey(projectId, taskId) }),
      queryClient.invalidateQueries({ queryKey: boardKeys.tasks(projectId) }),
    ])
}

export const useAddComment = (projectId: string, taskId: string) => {
  const refresh = useRefresh(projectId, taskId)
  return useMutation({
    mutationFn: (v: { text: string; mentions: string[] }) => commentApi.create({ projectId, taskId, ...v }),
    onSuccess: refresh,
  })
}

export const useRemoveComment = (projectId: string, taskId: string) => {
  const refresh = useRefresh(projectId, taskId)
  return useMutation({
    mutationFn: (commentId: string) => commentApi.remove({ projectId, taskId, commentId }),
    onSettled: refresh, // a 404 (already deleted) must still re-sync
  })
}