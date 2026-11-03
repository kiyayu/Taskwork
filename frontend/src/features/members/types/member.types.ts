//src/features/members/types/member.types.ts
export type MemberRole = 'owner' | 'editor' | 'viewer'
export type InviteRole = 'editor' | 'viewer'

export type Member = { userId: string; name: string; email: string; role: MemberRole }

export type Invite = { id: string; role: InviteRole; expiresAt: string; maxUses: number; uses: number }
// The raw token exists only in the answer to "create".
export type CreatedInvite = Invite & { token: string }