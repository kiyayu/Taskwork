//src/modules/invite/invite.model.ts
import mongoose, { Schema, Types, Document } from 'mongoose'

export interface IInvite extends Document {
  projectId: Types.ObjectId
  role: 'editor' | 'viewer'
  tokenHash: string
  createdBy: Types.ObjectId
  expiresAt: Date
  maxUses: number
  uses: number
}

const inviteSchema = new Schema<IInvite>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    role: { type: String, enum: ['editor', 'viewer'], required: true },
    tokenHash: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    maxUses: { type: Number, required: true },
    uses: { type: Number, default: 0 },
  },
  { timestamps: true }
)
// MongoDB deletes expired invites on its own
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Invite = mongoose.model<IInvite>('Invite', inviteSchema)