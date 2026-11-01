//src/features/board/utils/computeDrop.test.ts
import { describe, it, expect } from 'vitest'
import { computeDrop, listDropId } from './computeDrop'
import { computeOrder } from './order'
import type { Column } from './groupTasks'
import type { BoardTask } from '../types/board.types'

const task = (id: string, listId: string, order: number): BoardTask => ({
  id, projectId: 'p', title: id, description: '', listId, order, assigneeId: null, assigneeName: null,
  dueDate: null, priority: 2, archived: false, progress: { done: 0, total: 0, percent: 0 }, commentCount: 0, createdAt: '',
})
const col = (id: string, tasks: BoardTask[]): Column => ({ list: { id, projectId: 'p', name: id, order: 1 }, tasks })

const cols = (): Column[] => [
  col('l1', [task('A', 'l1', 1024), task('B', 'l1', 2048), task('C', 'l1', 3072)]),
  col('l2', [task('X', 'l2', 1024)]),
  col('l3', []),
]

describe('computeDrop', () => {
  it('moving up puts the task before the one it was dropped on', () => {
    expect(computeDrop(cols(), 'C', 'A')).toEqual({ taskId: 'C', listId: 'l1', aboveId: null, belowId: 'A' })
  })
  it('moving down puts the task after the one it was dropped on', () => {
    expect(computeDrop(cols(), 'A', 'B')).toEqual({ taskId: 'A', listId: 'l1', aboveId: 'B', belowId: 'C' })
    expect(computeDrop(cols(), 'A', 'C')).toEqual({ taskId: 'A', listId: 'l1', aboveId: 'C', belowId: null })
  })
  it('dropping on itself or on its own place changes nothing', () => {
    expect(computeDrop(cols(), 'B', 'B')).toBeNull()
    expect(computeDrop(cols(), 'C', listDropId('l1'))).toBeNull()
  })
  it('moving to another list inserts before the task dropped on', () => {
    expect(computeDrop(cols(), 'A', 'X')).toEqual({ taskId: 'A', listId: 'l2', aboveId: null, belowId: 'X' })
  })
  it('dropping on a column appends; an empty column has no neighbors', () => {
    expect(computeDrop(cols(), 'A', listDropId('l2'))).toEqual({ taskId: 'A', listId: 'l2', aboveId: 'X', belowId: null })
    expect(computeDrop(cols(), 'A', listDropId('l3'))).toEqual({ taskId: 'A', listId: 'l3', aboveId: null, belowId: null })
  })
  it('unknown ids return null', () => {
    expect(computeDrop(cols(), 'nope', 'A')).toBeNull()
    expect(computeDrop(cols(), 'A', 'nope')).toBeNull()
  })
})

describe('computeOrder (frontend mirror)', () => {
  it('matches the backend rules', () => {
    expect(computeOrder()).toBe(1024)
    expect(computeOrder(1024, 2048)).toBe(1536)
    expect(computeOrder(2048, null)).toBe(3072)
    expect(computeOrder(null, 1024)).toBe(0)
  })
})