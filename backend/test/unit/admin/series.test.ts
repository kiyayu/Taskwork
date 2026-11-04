//test/unit/admin/series.test.ts
import { describe, it, expect } from 'vitest'
import { fillDays } from '../../../src/modules/admin/admin.series'

describe('fillDays', () => {
  const now = new Date('2026-03-10T15:00:00Z')
  it('returns one entry per day, oldest first, zero where nothing happened', () => {
    const out = fillDays([{ _id: '2026-03-10', n: 3 }, { _id: '2026-03-08', n: 1 }], 4, now)
    expect(out).toEqual([
      { date: '2026-03-07', count: 0 },
      { date: '2026-03-08', count: 1 },
      { date: '2026-03-09', count: 0 },
      { date: '2026-03-10', count: 3 },
    ])
  })
  it('crosses a month boundary', () => {
    expect(fillDays([], 3, new Date('2026-03-01T00:00:00Z')).map((d) => d.date)).toEqual(['2026-02-27', '2026-02-28', '2026-03-01'])
  })
})