//src/modules/invite/invite.token.ts
import { createHash, randomBytes } from 'node:crypto'

export const generateToken = () => randomBytes(32).toString('hex') // 256 bits
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

export const isUsable = (inv: { expiresAt: Date; maxUses: number; uses: number }, now = new Date()) =>
  inv.expiresAt > now && inv.uses < inv.maxUses