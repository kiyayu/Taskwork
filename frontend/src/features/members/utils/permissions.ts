//src/features/members/utils/permissions.ts
import type { Member, MemberRole } from '../types/member.types'

// What the CURRENT user may do to one row. UX only: the server enforces the same rules.
export const memberActions = (myRole: MemberRole, myId: string, member: Member) => ({
  canChangeRole: myRole === 'owner' && member.role !== 'owner',
  canRemove: myRole === 'owner' && member.role !== 'owner' && member.userId !== myId,
  canLeave: member.userId === myId && member.role !== 'owner',
})