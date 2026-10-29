//test/integration/project/project.service.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { User } from '../../../src/modules/user/user.model'
import { Membership } from '../../../src/modules/project/membership.model'
import { projectService } from '../../../src/modules/project/project.service'

const makeUser = (plan: 'free' | 'pro' = 'free') =>
  User.create({
    name: 'Test User', email: `t${Date.now()}${Math.random()}@x.com`,
    password: 'hash', emailVerified: true, plan,
  })

describe('projectService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => clearTestDb())
  afterAll(async () => disconnectTestDb())

  it('creating a project makes the creator its owner', async () => {
    const u = await makeUser()
    const p = await projectService.create(u.id, 'Alpha')
    expect(p.role).toBe('owner')
    expect(await Membership.countDocuments({ userId: u.id, role: 'owner' })).toBe(1)
  })

  it('lists only my projects', async () => {
    const a = await makeUser(); const b = await makeUser()
    await projectService.create(a.id, 'A1')
    await projectService.create(b.id, 'B1')
    const mine = await projectService.listMine(a.id)
    expect(mine.map((p) => p.name)).toEqual(['A1'])
  })

  it('a non-member gets 404, not 403 (existence is not revealed)', async () => {
    const owner = await makeUser(); const stranger = await makeUser()
    const p = await projectService.create(owner.id, 'Secret')
    await expect(projectService.get(stranger.id, p.id)).rejects.toThrow(/not found/i)
  })

  it('a viewer can read but cannot update or delete', async () => {
    const owner = await makeUser(); const viewer = await makeUser()
    const p = await projectService.create(owner.id, 'Shared')
    await Membership.create({ projectId: p.id, userId: viewer.id, role: 'viewer' })

    await expect(projectService.get(viewer.id, p.id)).resolves.toMatchObject({ role: 'viewer' })
    await expect(projectService.update(viewer.id, p.id, 'x')).rejects.toThrow(/permission/i)
    await expect(projectService.remove(viewer.id, p.id)).rejects.toThrow(/permission/i)
  })

  it('an editor cannot delete the project', async () => {
    const owner = await makeUser(); const editor = await makeUser()
    const p = await projectService.create(owner.id, 'Shared')
    await Membership.create({ projectId: p.id, userId: editor.id, role: 'editor' })
    await expect(projectService.remove(editor.id, p.id)).rejects.toThrow(/permission/i)
  })

  it('the owner can update and delete', async () => {
    const u = await makeUser()
    const p = await projectService.create(u.id, 'Old')
    await expect(projectService.update(u.id, p.id, 'New')).resolves.toMatchObject({ name: 'New' })
    await projectService.remove(u.id, p.id)
    expect(await Membership.countDocuments({ projectId: p.id })).toBe(0)
  })

  it('the free plan stops at 3 projects, pro does not', async () => {
    const free = await makeUser('free')
    for (const n of ['1', '2', '3']) await projectService.create(free.id, n)
    await expect(projectService.create(free.id, '4')).rejects.toThrow(/limit/i)

    const pro = await makeUser('pro')
    for (const n of ['1', '2', '3', '4']) await projectService.create(pro.id, n)
    expect(await Membership.countDocuments({ userId: pro.id })).toBe(4)
  })
})