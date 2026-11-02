//src/features/board/comments/types.ts
export type TaskComment = {
  id: string
  taskId: string
  authorId: string
  authorName: string
  text: string
  mentions: string[]
  createdAt: string
}