//src/modules/overview/overview.logic.ts
// Due dates are date-only values stored as UTC midnight, so "today" is also UTC midnight.
export const bucketTasks = (tasks: { dueDate?: Date | null }[], now = new Date()) => {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const weekEnd = today + 7 * 86_400_000
  let overdue = 0
  let dueSoon = 0
  for (const t of tasks) {
    if (!t.dueDate) continue
    const due = t.dueDate.getTime()
    if (due < today) overdue++
    else if (due < weekEnd) dueSoon++
  }
  return { overdue, dueSoon }
}

// soonest due first, tasks without a due date last, then higher priority (1 = high) first
export const sortMyTasks = <T extends { dueDate?: Date | null; priority: number }>(tasks: T[]): T[] =>
  [...tasks].sort((a, b) => {
    const ad = a.dueDate ? a.dueDate.getTime() : Infinity
    const bd = b.dueDate ? b.dueDate.getTime() : Infinity
    return ad !== bd ? ad - bd : a.priority - b.priority
  })