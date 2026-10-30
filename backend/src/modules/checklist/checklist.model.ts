//src/modules/checklist/checklist.model.ts
import mongoose, { Schema, Types, Document } from 'mongoose'

export interface IChecklistItem extends Document {
  projectId: Types.ObjectId
  taskId: Types.ObjectId
  parentId: Types.ObjectId | null
  title: string
  completed: boolean
  order: number
}

const checklistSchema = new Schema<IChecklistItem>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'ChecklistItem', default: null },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
    order: { type: Number, required: true },
  },
  { timestamps: true }
)

checklistSchema.index({ taskId: 1, parentId: 1, order: 1 })

export const ChecklistItem = mongoose.model<IChecklistItem>('ChecklistItem', checklistSchema)