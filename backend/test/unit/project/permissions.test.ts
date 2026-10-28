//test/unit/project/permissions.test.ts
import { describe, it, expect } from 'vitest'
import { can, type Action } from '../../../src/modules/project/project.permissions'

describe('can()', () => {
  it('a non-member can do nothing', () => {
    expect(can(null, 'project:read')).toBe(false)
    expect(can(undefined, 'task:create')).toBe(false)
  })

  it('a viewer can only read', () => {
    expect(can('viewer', 'project:read')).toBe(true)
    for (const a of ['task:create', 'task:update', 'comment:create', 'member:invite'] as Action[]) {
      expect(can('viewer', a), a).toBe(false)
    }
  })

  it('an editor can work on tasks but not manage the project', () => {
    expect(can('editor', 'task:update')).toBe(true)
    expect(can('editor', 'comment:create')).toBe(true)
    expect(can('editor', 'member:invite')).toBe(false)
    expect(can('editor', 'project:delete')).toBe(false)
  })

  it('an owner can do everything', () => {
    for (const a of ['project:delete', 'member:invite', 'member:remove', 'task:delete'] as Action[]) {
      expect(can('owner', a), a).toBe(true)
    }
  })
})