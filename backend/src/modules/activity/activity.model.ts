//src/modules/activity/activity.model.ts
import mongoose, { Schema, Types, Document } from 'mongoose'
import { ACTIVITY_TYPES, type ActivityType, type ActivityMeta } from './activity.types.js'

export interface IActivity extends Document {
  projectId: Types.ObjectId
  taskId?: Types.ObjectId | null
  actorId: Types.ObjectId
  type: ActivityType
  meta: ActivityMeta
  createdAt: Date
}

const activitySchema = new Schema<IActivity>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

activitySchema.index({ projectId: 1, createdAt: -1 })
activitySchema.index({ taskId: 1, createdAt: -1 })
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 })

export const Activity = mongoose.model<IActivity>('Activity', activitySchema)