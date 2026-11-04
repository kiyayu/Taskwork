//test/unit/admin/requireRole.test.ts
import { describe, it, expect, vi } from 'vitest'
import { requireRole } from '../../../src/common/middlewares/requireRole'
import { ApiError } from '../../../src/common/errors/apiErrors'

const run = (role?: string) => {
  const next = vi.fn()
  requireRole(['admin'])({ user: role ? { role } : undefined } as any, {} as any, next)
  return next.mock.calls[0][0]
}

describe('requireRole(["admin"])', () => {
  it('lets an admin through', () => expect(run('admin')).toBeUndefined())
  it('refuses other roles with an ApiError', () => {
    expect(run('customer')).toBeInstanceOf(ApiError)
    expect(run('staff')).toBeInstanceOf(ApiError)
  })
  it('refuses a request with no user', () => expect(run()).toBeInstanceOf(ApiError))
})