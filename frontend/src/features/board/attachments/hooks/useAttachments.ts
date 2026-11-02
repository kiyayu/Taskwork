//src/features/board/attachments/hooks/useAttachments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attachmentApi } from '../api/attachment.api'

export const attachmentsKey = (projectId: string, taskId: string) =>
  ['board', projectId, 'attachments', taskId] as const

export const useAttachments = (projectId: string, taskId: string) =>
  useQuery({ queryKey: attachmentsKey(projectId, taskId), queryFn: () => attachmentApi.list({ projectId, taskId }) })

export const useAttach = (projectId: string, taskId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (v: { fileKey: string; name: string }) => attachmentApi.create({ projectId, taskId, ...v }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attachmentsKey(projectId, taskId) }),
  })
}

export const useRemoveAttachment = (projectId: string, taskId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: string) => attachmentApi.remove({ projectId, taskId, attachmentId }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: attachmentsKey(projectId, taskId) }),
  })
}