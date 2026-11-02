//src/features/board/attachments/types.ts
export type Attachment = {
  id: string
  taskId: string
  uploaderId: string
  uploaderName: string
  name: string
  url: string
  bytes: number
  createdAt: string
}