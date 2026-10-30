//test/integration/checklist/checklist.service.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { User } from '../../../src/modules/user/user.model'
import { Membership } from '../../../src/modules/project/membership.model'
import { ChecklistItem } from '../../../src/modules/checklist/checklist.model'
import { projectService } from '../../../src/modules/project/project.service'
import { taskService } from '../../../src/modules/task/task.service'
import { checklistService } from '../../../src/modules/checklist/checklist.service'

const makeUser = () =>
  User.create({ name: 'T', email: `t${Date.now()}${Math.random()}@x.com`, password: 'hash', emailVerified: true })

const setup = async () => {
  const owner = await makeUser()
  const project = await projectService.create(owner.id, 'P')
  const task = await taskService.create(owner.id, project.id, { title: 'T' })
  return { owner, project, task }
}

describe('checklistService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => clearTestDb())
  afterAll(async () => disconnectTestDb())

  it('a viewer can read but not change; a stranger gets 404', async () => {
    const { owner, project, task } = await setup()
    const viewer = await makeUser(); const stranger = await makeUser()
    await Membership.create({ projectId: project.id, userId: viewer.id, role: 'viewer' })
    await checklistService.create(owner.id, project.id, task.id, { title: 'A' })

    await expect(checklistService.list(viewer.id, project.id, task.id)).resolves.toBeTruthy()
    await expect(checklistService.create(viewer.id, project.id, task.id, { title: 'x' })).rejects.toThrow(/permission/i)
    await expect(checklistService.list(stranger.id, project.id, task.id)).rejects.toThrow(/not found/i)
  })

  it('adds items in order and reports progress', async () => {
    const { owner, project, task } = await setup()
    await checklistService.create(owner.id, project.id, task.id, { title: 'A' })
    const r = await checklistService.create(owner.id, project.id, task.id, { title: 'B' })
    expect(r.items.map((i) => i.title)).toEqual(['A', 'B'])
    expect(r.progress).toEqual({ done: 0, total: 2, percent: 0 })
  })

  it('refuses a third level', async () => {
    const { owner, project, task } = await setup()
    const a = (await checklistService.create(owner.id, project.id, task.id, { title: 'A' })).items[0]
    const s = (await checklistService.create(owner.id, project.id, task.id, { title: 'S', parentId: a.id })).items[1]
    await expect(
      checklistService.create(owner.id, project.id, task.id, { title: 'deep', parentId: s.id })
    ).rejects.toThrow(/own sub-items/i)
  })

  it('a parent cannot be completed while a sub-item is open', async () => {
    const { owner, project, task } = await setup()
    const a = (await checklistService.create(owner.id, project.id, task.id, { title: 'A' })).items[0]
    const s = (await checklistService.create(owner.id, project.id, task.id, { title: 'S', parentId: a.id })).items[1]

    await expect(
      checklistService.update(owner.id, project.id, task.id, a.id, { completed: true })
    ).rejects.toThrow(/sub-items/i)

    await checklistService.update(owner.id, project.id, task.id, s.id, { completed: true })
    const r = await checklistService.update(owner.id, project.id, task.id, a.id, { completed: true })
    expect(r.progress.percent).toBe(100)
  })

  it('un-completing a sub-item reopens its parent', async () => {
    const { owner, project, task } = await setup()
    const a = (await checklistService.create(owner.id, project.id, task.id, { title: 'A' })).items[0]
    const s = (await checklistService.create(owner.id, project.id, task.id, { title: 'S', parentId: a.id })).items[1]
    await checklistService.update(owner.id, project.id, task.id, s.id, { completed: true })
    await checklistService.update(owner.id, project.id, task.id, a.id, { completed: true })

    const r = await checklistService.update(owner.id, project.id, task.id, s.id, { completed: false })
    expect(r.items.find((i) => i.id === a.id)?.completed).toBe(false)
  })

  it('adding a sub-item reopens a completed parent', async () => {
    const { owner, project, task } = await setup()
    const a = (await checklistService.create(owner.id, project.id, task.id, { title: 'A' })).items[0]
    await checklistService.update(owner.id, project.id, task.id, a.id, { completed: true })
    const r = await checklistService.create(owner.id, project.id, task.id, { title: 'S', parentId: a.id })
    expect(r.items.find((i) => i.id === a.id)?.completed).toBe(false)
  })

  it('moving reorders one item and only among siblings', async () => {
    const { owner, project, task } = await setup()
    await checklistService.create(owner.id, project.id, task.id, { title: 'A' })
    await checklistService.create(owner.id, project.id, task.id, { title: 'B' })
    const r3 = await checklistService.create(owner.id, project.id, task.id, { title: 'C' })
    const [a, b, c] = r3.items

    const r = await checklistService.move(owner.id, project.id, task.id, c.id, { aboveId: a.id, belowId: b.id })
    expect(r.items.map((i) => i.title)).toEqual(['A', 'C', 'B'])

    const sub = (await checklistService.create(owner.id, project.id, task.id, { title: 'S', parentId: a.id }))
      .items.find((i) => i.title === 'S')!
    await expect(
      checklistService.move(owner.id, project.id, task.id, c.id, { aboveId: sub.id })
    ).rejects.toThrow(/neighbor/i)
  })

  it('deleting a parent deletes its sub-items; deleting a task deletes its checklist', async () => {
    const { owner, project, task } = await setup()
    const a = (await checklistService.create(owner.id, project.id, task.id, { title: 'A' })).items[0]
    await checklistService.create(owner.id, project.id, task.id, { title: 'S', parentId: a.id })
    const r = await checklistService.remove(owner.id, project.id, task.id, a.id)
    expect(r.items).toHaveLength(0)

    await checklistService.create(owner.id, project.id, task.id, { title: 'X' })
    await taskService.remove(owner.id, project.id, task.id)
    expect(await ChecklistItem.countDocuments({ taskId: task.id })).toBe(0)
  })

  it('an item id from another task is not found', async () => {
    const { owner, project, task } = await setup()
    const other = await taskService.create(owner.id, project.id, { title: 'Other' })
    const item = (await checklistService.create(owner.id, project.id, other.id, { title: 'X' })).items[0]
    await expect(
      checklistService.update(owner.id, project.id, task.id, item.id, { title: 'y' })
    ).rejects.toThrow(/not found/i)
  })
})