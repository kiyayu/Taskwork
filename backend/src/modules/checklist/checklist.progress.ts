//src/modules/checklist/checklist.progress.ts
export type Progress = { done: number; total: number; percent: number }

// Leaves are what count: a parent WITH sub-items is represented by them,
// a parent without sub-items counts as one unit.
export const computeProgress = (
  items: { id: string; parentId: string | null; completed: boolean }[]
): Progress => {
  const parentsWithChildren = new Set(items.filter((i) => i.parentId).map((i) => i.parentId))
  const leaves = items.filter((i) => !parentsWithChildren.has(i.id))
  const done = leaves.filter((i) => i.completed).length
  const total = leaves.length
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) }
}