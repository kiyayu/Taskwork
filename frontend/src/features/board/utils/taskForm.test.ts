//src/features/board/utils/taskForm.test.ts
import { describe, it, expect } from 'vitest'
import { toForm, toUpdateInput, NO_ASSIGNEE } from './taskForm'
import type { BoardTask } from '../types/board.types'

const task = (over: Partial<BoardTask> = {}): BoardTask => ({
  id: 't', projectId: 'p', title: 'T', description: 'D', listId: 'l', order: 1, assigneeId: null, assigneeName: null,
  dueDate: null, priority: 2, archived: false, progress: { done: 0, total: 0, percent: 0 }, commentCount: 0, createdAt: '',
  ...over,
})

describe('task form conversion', () => {
  it('maps an empty task to form values', () => {
    expect(toForm(task())).toEqual({ title: 'T', description: 'D', priority: '2', assigneeId: NO_ASSIGNEE, dueDate: '' })
  })
  it('keeps the date part of a due date and the assignee id', () => {
    const f = toForm(task({ dueDate: '2026-03-05T00:00:00.000Z', assigneeId: 'u1' }))
    expect(f.dueDate).toBe('2026-03-05')
    expect(f.assigneeId).toBe('u1')
  })
  it('converts form values to the API shape', () => {
    expect(toUpdateInput({ title: 'X', description: '', priority: '1', assigneeId: NO_ASSIGNEE, dueDate: '' })).toEqual({
      title: 'X', description: '', priority: 1, assigneeId: null, dueDate: null,
    })
    expect(toUpdateInput({ title: 'X', description: '', priority: '3', assigneeId: 'u1', dueDate: '2026-03-05' })).toMatchObject({
      priority: 3, assigneeId: 'u1', dueDate: '2026-03-05T00:00:00.000Z',
    })
  })
  it('round trips a due date without shifting the day', () => {
    const iso = toUpdateInput({ ...toForm(task({ dueDate: '2026-12-31T00:00:00.000Z' })) }).dueDate
    expect(iso).toBe('2026-12-31T00:00:00.000Z')
  })
})