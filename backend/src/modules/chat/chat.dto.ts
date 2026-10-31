//src/modules/chat/chat.dto.ts
export interface CreateMessageDTO {
  text: string
}

export interface ListMessagesQueryDTO {
  limit?: number
  before?: string // id of the oldest message the client already has
}

export interface ChatMessageDTO {
  id: string
  taskId: string
  authorId: string
  authorName: string
  text: string
  createdAt: Date
}

export interface ChatPageDTO {
  items: ChatMessageDTO[] // oldest first, ready to display
  nextBefore: string | null // pass back as `before` to load older messages; null = no more
}