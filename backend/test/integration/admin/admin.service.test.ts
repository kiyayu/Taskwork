//test/integration/admin/admin.service.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { User, TokenFamily } from '../../../src/modules/user/user.model'
import { projectService } from '../../../src/modules/project/project.service'
import { taskService } from '../../../src/modules/task/task.service'
import { adminService } from '../../../src/modules/admin/admin.service'
import { overviewService } from '../../../src/modules/overview/overview.service'
import { Membership } from '../../../src/modules/project/membership.model'

const make = (over: Record<string, unknown> = {}) =>
  User.create({ name: 'T', email: `t${Date.now()}${Math.random()}@x.com`, password: 'hash', emailVerified: true, ...over })

describe('adminService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => clearTestDb())
  afterAll(async () => disconnectTestDb())

  it('stats count users, plans, projects and tasks without exposing content', async () => {
    const a = await make(); await make({ plan: 'pro' })
    const p = await projectService.create(a.id, 'Secret name')
    await taskService.create(a.id, p.id, { title: 'Secret task' })
    const s = await adminService.stats()
    expect(s.users).toMatchObject({ total: 2, byPlan: { free: 1, pro: 1 } })
    expect(s.projects).toBe(1)
    expect(s.tasks).toEqual({ active: 1, archived: 0 })
    expect(s.signups).toHaveLength(14)
    expect(s.signups[13].count).toBe(2)
    expect(JSON.stringify(s)).not.toMatch(/Secret/)
  })

  it('lists users with search and pagination', async () => {
    await make({ name: 'Alice Zed' }); await make({ name: 'Bob' }); await make({ name: 'Carol' })
    const page = await adminService.listUsers({ limit: 2 })
    expect(page.items).toHaveLength(2)
    expect(page.pagination.totalPage).toBe(2)
    const found = await adminService.listUsers({ search: 'zed' })
    expect(found.items.map((u) => u.name)).toEqual(['Alice Zed'])
  })

  it('changes a plan', async () => {
    const admin = await make({ role: 'admin' }); const u = await make()
    expect((await adminService.updateUser(admin.id, u.id, { plan: 'pro' })).plan).toBe('pro')
  })

  it('deactivating also ends the user’s sessions', async () => {
    const admin = await make({ role: 'admin' }); const u = await make()
    await TokenFamily.create({ userId: u._id })
    await adminService.updateUser(admin.id, u.id, { isActive: false })
    expect(await TokenFamily.countDocuments({ userId: u._id })).toBe(0)
    expect((await User.findById(u.id))?.isActive).toBe(false)
  })

  it('refuses to change yourself or another admin; unknown id is 404', async () => {
    const admin = await make({ role: 'admin' }); const other = await make({ role: 'admin' })
    await expect(adminService.updateUser(admin.id, admin.id, { plan: 'pro' })).rejects.toThrow(/own account/i)
    await expect(adminService.updateUser(admin.id, other.id, { isActive: false })).rejects.toThrow(/admin/i)
    await expect(adminService.updateUser(admin.id, '5f0000000000000000000000', { plan: 'pro' })).rejects.toThrow(/not found/i)
  })
})

describe('overviewService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => clearTestDb())
  afterAll(async () => disconnectTestDb())

  it('counts only my assigned, non-archived tasks in projects I belong to', async () => {
    const me = await make(); const other = await make()
    const mine = await projectService.create(me.id, 'Mine')
    const theirs = await projectService.create(other.id, 'Theirs')
    await taskService.create(me.id, mine.id, { title: 'A', assigneeId: me.id })
    const archived = await taskService.create(me.id, mine.id, { title: 'B', assigneeId: me.id })
    await taskService.archive(me.id, mine.id, archived.id)
    await taskService.create(other.id, theirs.id, { title: 'C', assigneeId: other.id })

    const o = await overviewService.get(me.id)
    expect(o).toMatchObject({ projects: 1, assigned: 1 })
    expect(o.tasks[0]).toMatchObject({ title: 'A', projectName: 'Mine' })
  })

  it('hides tasks of a project I left', async () => {
    const owner = await make(); const me = await make()
    const p = await projectService.create(owner.id, 'P')
    await Membership.create({ projectId: p.id, userId: me.id, role: 'editor' })
    await taskService.create(owner.id, p.id, { title: 'T', assigneeId: me.id })
    await Membership.deleteOne({ projectId: p.id, userId: me.id })
    expect((await overviewService.get(me.id)).assigned).toBe(0)
  })
})