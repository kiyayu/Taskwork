//src/features/dashboard/hooks/useOverview.ts
import { useQuery } from '@tanstack/react-query'
import { overviewApi } from '../api/overview.api'

export const overviewKey = ['overview'] as const

// staleTime 0: the dashboard is the "what is true right now" page, so it refetches on every visit.
export const useOverview = () => useQuery({ queryKey: overviewKey, queryFn: overviewApi.get, staleTime: 0 })