//src/modules/chat/chat.model.ts
import { Schema, model } from 'mongoose'

const chatMessageSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
)

// the chat window always asks: "messages of THIS task, newest first, older than X"
chatMessageSchema.index({ taskId: 1, _id: -1 })

export const ChatMessage = model('ChatMessage', chatMessageSchema)