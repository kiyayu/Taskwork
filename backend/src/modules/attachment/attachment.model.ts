//src/modules/attachment/attachment.model.ts
import mongoose, { Schema, Types, Document } from 'mongoose'

export interface IAttachment extends Document {
  projectId: Types.ObjectId
  taskId: Types.ObjectId
  uploaderId: Types.ObjectId
  fileKey: string
  url: string
  name: string
  bytes: number
  createdAt: Date
}

const attachmentSchema = new Schema<IAttachment>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileKey: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    bytes: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

attachmentSchema.index({ taskId: 1, createdAt: 1 })

export const Attachment = mongoose.model<IAttachment>('Attachment', attachmentSchema)