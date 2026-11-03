//src/features/activity/hooks/useActivity.ts
import { useInfiniteQuery } from '@tanstack/react-query'
import { activityApi } from '../api/activity.api'

export const activityKey = (projectId: string) => ['activity', projectId] as const

// Cursor paging: the server returns nextBefore, which is passed back as the next page param.
export const useActivity = (projectId: string) =>
  useInfiniteQuery({
    queryKey: activityKey(projectId),
    queryFn: ({ pageParam }) => activityApi.list({ projectId, before: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextBefore ?? undefined,
    staleTime: 0, // always fresh when the panel opens
  })
  