//src/modules/list/list.model.ts
import mongoose, { Schema, Types, Document } from 'mongoose'

export interface IList extends Document {
  projectId: Types.ObjectId
  name: string
  order: number
}

const listSchema = new Schema<IList>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    order: { type: Number, required: true },
  },
  { timestamps: true }
)

listSchema.index({ projectId: 1, order: 1 })

export const List = mongoose.model<IList>('List', listSchema)