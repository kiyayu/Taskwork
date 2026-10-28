//src/modules/project/membership.model.ts
import mongoose, { Schema, Types, Document } from 'mongoose'
import { ROLES, type Role } from './project.permissions.js'

export interface IMembership extends Document {
  projectId: Types.ObjectId
  userId: Types.ObjectId
  role: Role
}

const membershipSchema = new Schema<IMembership>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ROLES, required: true },
  },
  { timestamps: true }
)

membershipSchema.index({ projectId: 1, userId: 1 }, { unique: true })
membershipSchema.index({ userId: 1 })

export const Membership = mongoose.model<IMembership>('Membership', membershipSchema)