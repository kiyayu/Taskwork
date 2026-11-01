//src/features/board/hooks/useMoveTask.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { boardApi } from '../api/board.api'
import type { BoardTask } from '../types/board.types'
import { boardKeys, useMoveTask } from './useBoard'

const task = (id: string, listId: string, order: number): BoardTask => ({
  id, projectId: 'p', title: id, description: '', listId, order, assigneeId: null, assigneeName: null,
  dueDate: null, priority: 2, archived: false, progress: { done: 0, total: 0, percent: 0 }, commentCount: 0, createdAt: '',
})

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  queryClient.setQueryData(boardKeys.tasks('p'), [task('a', 'l1', 1024), task('b', 'l1', 2048)])
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper }
}
const read = (qc: QueryClient) => qc.getQueryData<BoardTask[]>(boardKeys.tasks('p'))!

describe('useMoveTask', () => {
  it('moves the card immediately, then puts it back when the server refuses', async () => {
    let fail!: (e: Error) => void
    vi.spyOn(boardApi, 'moveTask').mockReturnValue(new Promise<void>((_, reject) => { fail = reject }))
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useMoveTask('p'), { wrapper })

    act(() => { result.current.mutate({ taskId: 'a', listId: 'l2', aboveId: null, belowId: null }) })
    await waitFor(() => expect(read(queryClient).find((t) => t.id === 'a')).toMatchObject({ listId: 'l2', order: 1024 }))

    await act(async () => { fail(new Error('refused')) })
    await waitFor(() => expect(read(queryClient).find((t) => t.id === 'a')).toMatchObject({ listId: 'l1', order: 1024 }))
  })

  it('keeps the new position when the server accepts', async () => {
    vi.spyOn(boardApi, 'moveTask').mockResolvedValue(undefined)
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useMoveTask('p'), { wrapper })

    await act(() => result.current.mutateAsync({ taskId: 'a', listId: 'l1', aboveId: 'b', belowId: null }))
    expect(read(queryClient).find((t) => t.id === 'a')?.order).toBe(3072)
  })
})