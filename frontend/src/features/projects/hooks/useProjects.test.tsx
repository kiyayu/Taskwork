//src/features/projects/hooks/useProjects.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { projectApi } from '../api/project.api'
import { projectKeys, useCreateProject, useProjects } from './useProjects'

const project = { id: '1', name: 'A', role: 'owner' as const, createdAt: '' }

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}

describe('project hooks', () => {
  it('loads the list under the projects list key', async () => {
    vi.spyOn(projectApi, 'list').mockResolvedValue([project])
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useProjects(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(projectKeys.list)).toEqual([project])
  })

  it('creating a project invalidates the projects prefix', async () => {
    vi.spyOn(projectApi, 'create').mockResolvedValue(project)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(projectKeys.list, [])
    const { result } = renderHook(() => useCreateProject(), { wrapper })

    await act(() => result.current.mutateAsync('A'))

    expect(queryClient.getQueryState(projectKeys.list)?.isInvalidated).toBe(true)
  })
})