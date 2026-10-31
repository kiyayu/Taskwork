//test/unit/invite/token.test.ts
import { describe, it, expect } from 'vitest'
import { generateToken, hashToken, isUsable } from '../../../src/modules/invite/invite.token'

describe('invite token', () => {
  it('generates unique 64-char tokens', () => {
    const a = generateToken()
    expect(a).toHaveLength(64)
    expect(a).not.toBe(generateToken())
  })
  it('hashes deterministically and never equals the token', () => {
    const t = generateToken()
    expect(hashToken(t)).toBe(hashToken(t))
    expect(hashToken(t)).not.toBe(t)
  })
  it('isUsable respects expiry and use count', () => {
    const future = new Date(Date.now() + 1000), past = new Date(Date.now() - 1000)
    expect(isUsable({ expiresAt: future, maxUses: 5, uses: 0 })).toBe(true)
    expect(isUsable({ expiresAt: past, maxUses: 5, uses: 0 })).toBe(false)
    expect(isUsable({ expiresAt: future, maxUses: 5, uses: 5 })).toBe(false)
  })
})