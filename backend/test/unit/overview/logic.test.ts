//test/unit/overview/logic.test.ts
import { describe, it, expect } from 'vitest'
import { bucketTasks, sortMyTasks } from '../../../src/modules/overview/overview.logic'

const now = new Date('2026-03-10T15:00:00Z')
const d = (s: string | null) => (s ? new Date(`${s}T00:00:00Z`) : null)

describe('bucketTasks', () => {
  it('counts overdue and due within 7 days, ignores no date and far dates', () => {
    const r = bucketTasks([{ dueDate: d('2026-03-09') }, { dueDate: d('2026-03-10') }, { dueDate: d('2026-03-16') },
      { dueDate: d('2026-03-17') }, { dueDate: null }], now)
    expect(r).toEqual({ overdue: 1, dueSoon: 2 })
  })
})

describe('sortMyTasks', () => {
  it('sorts by due date, undated last, then by priority', () => {
    const out = sortMyTasks([
      { id: 'c', dueDate: null, priority: 1 },
      { id: 'b', dueDate: d('2026-03-12'), priority: 3 },
      { id: 'a', dueDate: d('2026-03-12'), priority: 1 },
    ])
    expect(out.map((t) => t.id)).toEqual(['a', 'b', 'c'])
  })
})