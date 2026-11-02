//src/features/board/utils/taskForm.ts
import type { UpdateTaskInput } from '../api/board.api'
import type { TaskDetailsFormValues } from '../schemas/board.schema'
import type { BoardTask } from '../types/board.types'

// Select components cannot use an empty string as a value, so "nobody" gets a sentinel.
export const NO_ASSIGNEE = 'none'

export const toForm = (task: BoardTask): TaskDetailsFormValues => ({
  title: task.title,
  description: task.description,
  priority: String(task.priority) as '1' | '2' | '3',
  assigneeId: task.assigneeId ?? NO_ASSIGNEE,
  dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
})

export const toUpdateInput = (v: TaskDetailsFormValues): UpdateTaskInput => ({
  title: v.title,
  description: v.description,
  priority: Number(v.priority) as 1 | 2 | 3,
  assigneeId: v.assigneeId === NO_ASSIGNEE ? null : v.assigneeId,
  dueDate: v.dueDate ? new Date(`${v.dueDate}T00:00:00.000Z`).toISOString() : null,
})