//src/features/members/types/member.types.ts
export type MemberRole = 'owner' | 'editor' | 'viewer'

export type Member = { userId: string; name: string; email: string; role: MemberRole }