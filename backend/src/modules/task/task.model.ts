//src/modules/task/task.model.ts
import mongoose, { Schema, Types, Document } from 'mongoose'

 
export interface ITask extends Document {
  projectId: Types.ObjectId
  title: string
  description: string
 listId: Types.ObjectId   
  order: number
  assigneeId?: Types.ObjectId | null
  dueDate?: Date | null
  priority: 1 | 2 | 3  
  createdBy: Types.ObjectId
  archivedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 5000 },
listId: { type: Schema.Types.ObjectId, ref: 'List', required: true },      order: { type: Number, required: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    dueDate: { type: Date, default: null },
    priority: { type: Number, enum: [1, 2, 3], default: 2 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
)
 
taskSchema.index({ projectId: 1, listId: 1, order: 1 })   
export const Task = mongoose.model<ITask>('Task', taskSchema)