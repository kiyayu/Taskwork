//src/modules/project/project.model.ts
import mongoose, { Schema, Types, Document } from 'mongoose'

export interface IProject extends Document {
  name: string
  ownerId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
)

export const Project = mongoose.model<IProject>('Project', projectSchema)