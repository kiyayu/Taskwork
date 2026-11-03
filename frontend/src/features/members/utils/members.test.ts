//src/features/members/utils/members.test.ts
import { describe, it, expect } from 'vitest'
import { memberActions } from './permissions'
import { buildInviteLink, isInviteToken } from './inviteLink'
import type { Member } from '../types/member.types'

const m = (userId: string, role: Member['role']): Member => ({ userId, name: userId, email: '', role })

describe('memberActions', () => {
  it('the owner can change and remove others but not themself', () => {
    expect(memberActions('owner', 'o', m('e', 'editor'))).toEqual({ canChangeRole: true, canRemove: true, canLeave: false })
    expect(memberActions('owner', 'o', m('o', 'owner'))).toEqual({ canChangeRole: false, canRemove: false, canLeave: false })
  })
  it('an editor can only leave', () => {
    expect(memberActions('editor', 'e', m('e', 'editor'))).toEqual({ canChangeRole: false, canRemove: false, canLeave: true })
    expect(memberActions('editor', 'e', m('v', 'viewer'))).toEqual({ canChangeRole: false, canRemove: false, canLeave: false })
  })
  it('nobody can touch the owner row except to read it', () => {
    expect(memberActions('owner', 'x', m('o2', 'owner')).canRemove).toBe(false)
  })
})

describe('invite links', () => {
  it('builds a link under /app so login can redirect back to it', () => {
    expect(buildInviteLink('a'.repeat(64), 'https://x.com')).toBe(`https://x.com/app/invite/${'a'.repeat(64)}`)
  })
  it('accepts only 64 hex characters', () => {
    expect(isInviteToken('a'.repeat(64))).toBe(true)
    for (const bad of [undefined, '', 'abc', 'g'.repeat(64), 'a'.repeat(65)]) expect(isInviteToken(bad)).toBe(false)
  })
})