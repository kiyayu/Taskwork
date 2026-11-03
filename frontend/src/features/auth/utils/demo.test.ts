//src/features/auth/utils/demo.test.ts
import { describe, it, expect } from 'vitest'
import { getDemoCredentials } from './demo'

describe('getDemoCredentials', () => {
  it('returns credentials only when both values are set', () => {
    expect(getDemoCredentials({ demoEmail: 'a@b.c', demoPassword: 'x' })).toEqual({ email: 'a@b.c', password: 'x' })
    expect(getDemoCredentials({ demoEmail: 'a@b.c' })).toBeNull()
    expect(getDemoCredentials({ demoPassword: 'x' })).toBeNull()
    expect(getDemoCredentials({ demoEmail: '', demoPassword: '' })).toBeNull()
  })
})