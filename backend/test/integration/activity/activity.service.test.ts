//test/integration/activity/activity.service.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { User } from '../../../src/modules/user/user.model'
import { Activity } from '../../../src/modules/activity/activity.model'
import { projectService } from '../../../src/modules/project/project.service'
import { taskService } from '../../../src/modules/task/task.service'
import { listService } from '../../../src/modules/list/list.service'
import { activityService } from '../../../src/modules/activity/activity.service'

const makeUser = () =>
  User.create({ name: 'Ann', email: `t${Date.now()}${Math.random()}@x.com`, password: 'hash', emailVerified: true })

const setup = async () => {
  const owner = await makeUser()
  const project = await projectService.create(owner.id, 'P')
  return { owner, project }
}

describe('activityService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => clearTestDb())
  afterAll(async () => disconnectTestDb())

  it('records task creation with facts, not sentences', async () => {
    const { owner, project } = await setup()
    await taskService.create(owner.id, project.id, { title: 'Write spec' })
    const feed = await activityService.list(owner.id, project.id, {})
    expect(feed.items[0]).toMatchObject({ type: 'task_created', actorName: 'Ann', meta: { taskTitle: 'Write spec' } })
  })

  it('logs a move between lists but not a reorder inside one list', async () => {
    const { owner, project } = await setup()
    const a = await taskService.create(owner.id, project.id, { title: 'A' })
    const b = await taskService.create(owner.id, project.id, { title: 'B' })
    await taskService.move(owner.id, project.id, b.id, { listId: a.listId, aboveId: null, belowId: a.id })
    expect(await Activity.countDocuments({ type: 'task_moved' })).toBe(0)

    const other = await listService.create(owner.id, project.id, { name: 'Review' })
    await taskService.move(owner.id, project.id, b.id, { listId: other.id })
    const moved = await Activity.findOne({ type: 'task_moved' })
    expect(moved?.meta).toMatchObject({ taskTitle: 'B', listName: 'Review' })
  })

  it('a stranger gets 404 and a viewer can read', async () => {
    const { project } = await setup()
    await expect(activityService.list((await makeUser()).id, project.id, {})).rejects.toThrow(/not found/i)
  })

  it('pages with a cursor, newest first, without repeats', async () => {
    const { owner, project } = await setup()
    for (let i = 0; i < 5; i++) await taskService.create(owner.id, project.id, { title: `T${i}` })
    const p1 = await activityService.list(owner.id, project.id, { limit: 3 })
    expect(p1.items).toHaveLength(3)
    expect(p1.nextBefore).not.toBeNull()
    const p2 = await activityService.list(owner.id, project.id, { limit: 3, before: p1.nextBefore! })
    const ids = new Set([...p1.items, ...p2.items].map((i) => i.id))
    expect(ids.size).toBe(p1.items.length + p2.items.length)
  })

  it('never throws when recording fails', async () => {
    await expect(
      activityService.record({ projectId: 'not-an-id', actorId: 'x', type: 'task_created' })
    ).resolves.toBeUndefined()
  })

  it('deleting a project deletes its feed', async () => {
    const { owner, project } = await setup()
    await taskService.create(owner.id, project.id, { title: 'T' })
    await projectService.remove(owner.id, project.id)
    expect(await Activity.countDocuments({ projectId: project.id })).toBe(0)
  })
})