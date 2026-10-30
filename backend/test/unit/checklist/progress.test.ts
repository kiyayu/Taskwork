//test/unit/checklist/progress.test.ts
import { describe, it, expect } from 'vitest'
import { computeProgress } from '../../../src/modules/checklist/checklist.progress'

const item = (id: string, parentId: string | null, completed: boolean) => ({ id, parentId, completed })

describe('computeProgress', () => {
  it('is 0 for an empty checklist', () => {
    expect(computeProgress([])).toEqual({ done: 0, total: 0, percent: 0 })
  })
  it('counts plain items', () => {
    expect(computeProgress([item('a', null, true), item('b', null, false)])).toEqual({ done: 1, total: 2, percent: 50 })
  })
  it('counts sub-items instead of their parent', () => {
    const r = computeProgress([
      item('p', null, false), item('s1', 'p', true), item('s2', 'p', false), item('s3', 'p', true),
    ])
    expect(r).toEqual({ done: 2, total: 3, percent: 67 })
  })
  it('mixes parents with and without sub-items', () => {
    const r = computeProgress([item('p', null, false), item('s', 'p', true), item('q', null, true)])
    expect(r).toEqual({ done: 2, total: 2, percent: 100 })
  })
})