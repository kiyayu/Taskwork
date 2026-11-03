//src/features/live/hooks/useProjectLive.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useProjectLive } from './useProjectLive'

class FakeSource {
  static last: FakeSource
  static CLOSED = 2
  readyState = 1
  onopen: (() => void) | null = null
  onmessage: ((m: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  close = vi.fn(() => { this.readyState = 2 })
  constructor(public url: string) { FakeSource.last = this }
  emit(data: object) { this.onmessage?.({ data: JSON.stringify(data) }) }
}

describe('useProjectLive', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.stubGlobal('EventSource', FakeSource) })
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

  const setup = () => {
    const queryClient = new QueryClient()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const hook = renderHook(() => useProjectLive('p', 'me'), { wrapper })
    return { spy, ...hook }
  }

  it("refreshes the board when someone else changes a task", () => {
    const { spy } = setup()
    act(() => { FakeSource.last.emit({ type: 'tasks_changed', projectId: 'p', actorId: 'other' }); vi.advanceTimersByTime(200) })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['board', 'p', 'tasks'] })
  })

  it('ignores my own events and events of other projects', () => {
    const { spy } = setup()
    act(() => {
      FakeSource.last.emit({ type: 'tasks_changed', projectId: 'p', actorId: 'me' })
      FakeSource.last.emit({ type: 'tasks_changed', projectId: 'other', actorId: 'x' })
      vi.advanceTimersByTime(200)
    })
    expect(spy).not.toHaveBeenCalled()
  })

  it('batches a burst into one invalidation per key', () => {
    const { spy } = setup()
    act(() => {
      for (let i = 0; i < 5; i++) FakeSource.last.emit({ type: 'tasks_changed', projectId: 'p', actorId: 'o' })
      vi.advanceTimersByTime(200)
    })
    expect(spy).toHaveBeenCalledTimes(2) // tasks + lists, once each
  })

  it('closes the stream on unmount', () => {
    const { unmount } = setup()
    const source = FakeSource.last
    unmount()
    expect(source.close).toHaveBeenCalled()
  })
})