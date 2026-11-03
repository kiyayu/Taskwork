//src/features/members/utils/inviteLink.ts
import { paths } from '@/config/paths'

export const buildInviteLink = (token: string, origin: string): string => `${origin}${paths.app.invite(token)}`

// Invite tokens are 32 random bytes in hex. Anything else is rejected before any request is made.
export const isInviteToken = (value: string | undefined): value is string => !!value && /^[0-9a-f]{64}$/.test(value)