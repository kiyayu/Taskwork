//src/features/board/utils/computeDrop.ts
import type { Column } from './groupTasks'

export const LIST_PREFIX = 'list:'
export const listDropId = (listId: string) => `${LIST_PREFIX}${listId}`

export type Drop = { taskId: string; listId: string; aboveId: string | null; belowId: string | null }

// Turns "task A was dropped on X" into the neighbors the backend needs.
// X is either another task (insert at its place) or a column (append). Returns null when nothing changes.
export const computeDrop = (columns: Column[], activeId: string, overId: string): Drop | null => {
  const source = columns.find((c) => c.tasks.some((t) => t.id === activeId))
  if (!source) return null
  const sourceIndex = source.tasks.findIndex((t) => t.id === activeId)

  let target: Column | undefined
  let index: number

  if (overId.startsWith(LIST_PREFIX)) {
    target = columns.find((c) => c.list.id === overId.slice(LIST_PREFIX.length))
    if (!target) return null
    index = target.tasks.filter((t) => t.id !== activeId).length // append
  } else {
    if (overId === activeId) return null
    target = columns.find((c) => c.tasks.some((t) => t.id === overId))
    if (!target) return null
    const without = target.tasks.filter((t) => t.id !== activeId)
    const overIndex = without.findIndex((t) => t.id === overId)
    // moving down inside one column lands AFTER the task you dropped on; otherwise BEFORE it
    const movingDown = target === source && sourceIndex < target.tasks.findIndex((t) => t.id === overId)
    index = movingDown ? overIndex + 1 : overIndex
  }

  if (target === source && index === sourceIndex) return null

  const without = target.tasks.filter((t) => t.id !== activeId)
  return {
    taskId: activeId,
    listId: target.list.id,
    aboveId: without[index - 1]?.id ?? null,
    belowId: without[index]?.id ?? null,
  }
}