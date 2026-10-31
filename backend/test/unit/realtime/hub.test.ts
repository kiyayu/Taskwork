//test/unit/realtime/hub.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { hub } from '../../../src/modules/realtime/realtime.hub'

const fakeRes = () => ({ write: vi.fn(), end: vi.fn() }) as any

describe('hub', () => {
  beforeEach(() => hub.clear())

  it('delivers only to the project room', () => {
    const a = fakeRes(), b = fakeRes()
    hub.join('p1', { res: a, userId: 'u1' })
    hub.join('p2', { res: b, userId: 'u2' })
    hub.publish({ type: 'task_changed', projectId: 'p1' })
    expect(a.write).toHaveBeenCalledOnce()
    expect(b.write).not.toHaveBeenCalled()
  })

  it('formats as an SSE message', () => {
    const a = fakeRes()
    hub.join('p', { res: a, userId: 'u' })
    hub.publish({ type: 'x', projectId: 'p' })
    expect(a.write.mock.calls[0][0]).toMatch(/^data: \{.*\}\n\n$/)
  })

  it('survives a broken connection and removes it', () => {
    const bad = { write: vi.fn(() => { throw new Error('closed') }), end: vi.fn() } as any
    const good = fakeRes()
    hub.join('p', { res: bad, userId: 'u1' })
    hub.join('p', { res: good, userId: 'u2' })
    expect(() => hub.publish({ type: 'x', projectId: 'p' })).not.toThrow()
    expect(good.write).toHaveBeenCalled()
    expect(hub.size('p')).toBe(1)
  })

  it('removes the room when the last broken connection is dropped', () => {
    const bad = { write: vi.fn(() => { throw new Error('closed') }), end: vi.fn() } as any
    hub.join('p', { res: bad, userId: 'u1' })
    hub.publish({ type: 'x', projectId: 'p' })
    expect(hub.size('p')).toBe(0)
  })

  it('leave empties and removes the room; kick closes only that user', () => {
    const a = fakeRes(), b = fakeRes()
    const ca = { res: a, userId: 'u1' }
    hub.join('p', ca); hub.join('p', { res: b, userId: 'u2' })
    hub.kick('p', 'u2')
    expect(b.end).toHaveBeenCalled()
    expect(a.end).not.toHaveBeenCalled()
    hub.leave('p', ca)
    expect(hub.size('p')).toBe(0)
  })

  it('closeRoom ends every stream in the project and leaves other projects alone', () => {
    const a = fakeRes(), b = fakeRes(), other = fakeRes()
    hub.join('p', { res: a, userId: 'u1' })
    hub.join('p', { res: b, userId: 'u2' })
    hub.join('q', { res: other, userId: 'u3' })
    hub.closeRoom('p')
    expect(a.end).toHaveBeenCalled()
    expect(b.end).toHaveBeenCalled()
    expect(other.end).not.toHaveBeenCalled()
    expect(hub.size('p')).toBe(0)
    expect(hub.size('q')).toBe(1)
  })
})