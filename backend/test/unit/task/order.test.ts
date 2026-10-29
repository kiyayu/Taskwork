//test/unit/task/order.test.ts
import { describe, it, expect } from 'vitest'
import { computeOrder } from '../../../src/modules/task/task.order'

describe('computeOrder', () => {
  it('starts an empty column', () => expect(computeOrder()).toBe(1024))
  it('goes between two neighbors', () => expect(computeOrder(1024, 2048)).toBe(1536))
  it('goes to the bottom', () => expect(computeOrder(2048, null)).toBe(3072))
  it('goes to the top', () => expect(computeOrder(null, 1024)).toBe(0))
  it('stays strictly between neighbors after many inserts', () => {
    let below = 2048
    for (let i = 0; i < 40; i++) {
      const next = computeOrder(1024, below)
      expect(next).toBeGreaterThan(1024)
      expect(next).toBeLessThan(below)
      below = next
    }
  })
})