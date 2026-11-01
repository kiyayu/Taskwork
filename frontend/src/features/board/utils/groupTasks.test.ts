//src/features/board/utils/groupTasks.test.ts
import { describe, it, expect } from 'vitest'
import { groupTasksByList } from './groupTasks'
import type { BoardList, BoardTask } from '../types/board.types'

const list = (id: string, order: number): BoardList => ({ id, projectId: 'p', name: id, order })
const task = (id: string, listId: string, order: number, archived = false): BoardTask => ({
  id, projectId: 'p', title: id, description: '', listId, order, assigneeId: null, assigneeName: null,
  dueDate: null, priority: 2, archived, progress: { done: 0, total: 0, percent: 0 }, commentCount: 0, createdAt: '',
})

describe('groupTasksByList', () => {
  it('orders lists and tasks by their order value', () => {
    const cols = groupTasksByList(
      [list('b', 2048), list('a', 1024)],
      [task('t2', 'a', 2048), task('t1', 'a', 1024), task('t3', 'b', 1024)]
    )
    expect(cols.map((c) => c.list.id)).toEqual(['a', 'b'])
    expect(cols[0].tasks.map((t) => t.id)).toEqual(['t1', 't2'])
  })

  it('hides archived tasks and ignores tasks of unknown lists', () => {
    const cols = groupTasksByList([list('a', 1)], [task('x', 'a', 1, true), task('y', 'gone', 1)])
    expect(cols[0].tasks).toHaveLength(0)
  })

  it('returns an empty column for a list without tasks', () => {
    expect(groupTasksByList([list('a', 1)], [])).toEqual([{ list: list('a', 1), tasks: [] }])
  })
})