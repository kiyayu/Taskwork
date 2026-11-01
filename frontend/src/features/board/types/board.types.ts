//src/features/board/types/board.types.ts
export type BoardList = { id: string; projectId: string; name: string; order: number }

export type Progress = { done: number; total: number; percent: number }

export type BoardTask = {
  id: string
  projectId: string
  title: string
  description: string
  listId: string
  order: number
  assigneeId: string | null
  assigneeName: string | null
  dueDate: string | null
  priority: 1 | 2 | 3
  archived: boolean
  progress: Progress
  commentCount: number
  createdAt: string
}