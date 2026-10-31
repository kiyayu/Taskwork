//test/integration/invite/invite.service.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { User } from '../../../src/modules/user/user.model'
import { Membership } from '../../../src/modules/project/membership.model'
import { Invite } from '../../../src/modules/invite/invite.model'
import { projectService } from '../../../src/modules/project/project.service'
import { taskService } from '../../../src/modules/task/task.service'
import { inviteService } from '../../../src/modules/invite/invite.service'

const makeUser = (plan: 'free' | 'pro' = 'free') =>
  User.create({ name: 'T', email: `t${Date.now()}${Math.random()}@x.com`, password: 'hash', emailVerified: true, plan })

const setup = async () => {
  const owner = await makeUser()
  const project = await projectService.create(owner.id, 'P')
  return { owner, project }
}
const mk = (o: string, p: string, role: 'editor' | 'viewer' = 'editor', extra = {}) =>
  inviteService.create(o, p, { role, expiresInDays: 7, maxUses: 10, ...extra })

describe('inviteService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => clearTestDb())
  afterAll(async () => disconnectTestDb())

  it('only the owner can invite; the token is stored hashed', async () => {
    const { owner, project } = await setup()
    const editor = await makeUser()
    await Membership.create({ projectId: project.id, userId: editor.id, role: 'editor' })
    await expect(mk(editor.id, project.id)).rejects.toThrow(/permission/i)

    const inv = await mk(owner.id, project.id)
    const row = await Invite.findById(inv.id)
    expect(row?.tokenHash).not.toBe(inv.token)
  })

  it('accepting adds the membership with the invited role', async () => {
    const { owner, project } = await setup()
    const guest = await makeUser()
    const inv = await mk(owner.id, project.id, 'viewer')
    const r = await inviteService.accept(guest.id, inv.token)
    expect(r.role).toBe('viewer')
    expect(await Membership.countDocuments({ projectId: project.id, userId: guest.id })).toBe(1)
  })

  it('accepting twice is harmless and uses one slot', async () => {
    const { owner, project } = await setup()
    const guest = await makeUser()
    const inv = await mk(owner.id, project.id)
    await inviteService.accept(guest.id, inv.token)
    await inviteService.accept(guest.id, inv.token)
    expect((await Invite.findById(inv.id))?.uses).toBe(1)
  })

  it('rejects an unknown, expired or exhausted token', async () => {
    const { owner, project } = await setup()
    const guest = await makeUser(); const g2 = await makeUser()
    await expect(inviteService.accept(guest.id, 'a'.repeat(64))).rejects.toThrow(/invalid/i)

    const used = await mk(owner.id, project.id, 'editor', { maxUses: 1 })
    await inviteService.accept(guest.id, used.token)
    await expect(inviteService.accept(g2.id, used.token)).rejects.toThrow(/invalid/i)

    const exp = await mk(owner.id, project.id)
    await Invite.updateOne({ _id: exp.id }, { expiresAt: new Date(Date.now() - 1000) })
    await expect(inviteService.accept(g2.id, exp.token)).rejects.toThrow(/invalid/i)
  })

  it('simultaneous accepts cannot exceed maxUses', async () => {
    const { owner, project } = await setup()
    const inv = await mk(owner.id, project.id, 'editor', { maxUses: 1 })
    const users = await Promise.all([makeUser(), makeUser(), makeUser()])
    const results = await Promise.allSettled(users.map((u) => inviteService.accept(u.id, inv.token)))
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1)
    expect(await Membership.countDocuments({ projectId: project.id })).toBe(2) // owner + one
  })

  it('the free plan caps members per project', async () => {
    const { owner, project } = await setup()
    const inv = await mk(owner.id, project.id)
    for (let i = 0; i < 4; i++) await inviteService.accept((await makeUser()).id, inv.token) // owner + 4 = 5
    await expect(inviteService.accept((await makeUser()).id, inv.token)).rejects.toThrow(/limit/i)
  })

  it('owner changes roles; the owner role is protected', async () => {
    const { owner, project } = await setup()
    const guest = await makeUser()
    await inviteService.accept(guest.id, (await mk(owner.id, project.id)).token)
    await inviteService.updateRole(owner.id, project.id, guest.id, 'viewer')
    expect((await Membership.findOne({ projectId: project.id, userId: guest.id }))?.role).toBe('viewer')
    await expect(inviteService.updateRole(owner.id, project.id, owner.id, 'viewer')).rejects.toThrow(/owner/i)
    await expect(inviteService.updateRole(guest.id, project.id, guest.id, 'editor')).rejects.toThrow(/permission/i)
  })

  it('removing a member unassigns their tasks; members can leave; owner cannot', async () => {
    const { owner, project } = await setup()
    const guest = await makeUser()
    await inviteService.accept(guest.id, (await mk(owner.id, project.id)).token)
    const t = await taskService.create(owner.id, project.id, { title: 'T', assigneeId: guest.id })

    await inviteService.removeMember(guest.id, project.id, guest.id) // leave
    expect((await taskService.get(owner.id, project.id, t.id)).assigneeId).toBeNull()
    await expect(inviteService.removeMember(owner.id, project.id, owner.id)).rejects.toThrow(/owner/i)
  })

  it('a non-owner cannot remove someone else', async () => {
    const { owner, project } = await setup()
    const a = await makeUser(); const b = await makeUser()
    const inv = await mk(owner.id, project.id)
    await inviteService.accept(a.id, inv.token); await inviteService.accept(b.id, inv.token)
    await expect(inviteService.removeMember(a.id, project.id, b.id)).rejects.toThrow(/permission/i)
  })

  it('a stranger cannot list members', async () => {
    const { project } = await setup()
    await expect(inviteService.listMembers((await makeUser()).id, project.id)).rejects.toThrow(/not found/i)
  })
})