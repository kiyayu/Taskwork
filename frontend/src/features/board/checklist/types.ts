//src/features/board/checklist/types.ts
import type { Progress } from '../types/board.types'

export type ChecklistItem = {
  id: string
  taskId: string
  parentId: string | null
  title: string
  completed: boolean
  order: number
}

// Every mutation on the server returns the full snapshot, so progress is never computed here.
export type ChecklistSnapshot = { items: ChecklistItem[]; progress: Progress }