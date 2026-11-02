//src/features/board/checklist/utils/tree.ts
import type { ChecklistItem } from '../types'

export type ChecklistNode = { item: ChecklistItem; children: ChecklistItem[] }

// Two levels only (the server enforces it). Children whose parent is missing are dropped.
export const buildChecklistTree = (items: ChecklistItem[]): ChecklistNode[] => {
  const sorted = [...items].sort((a, b) => a.order - b.order)
  return sorted
    .filter((i) => !i.parentId)
    .map((item) => ({ item, children: sorted.filter((c) => c.parentId === item.id) }))
}