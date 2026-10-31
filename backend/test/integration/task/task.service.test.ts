//test/integration/task/task.service.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { User } from '../../../src/modules/user/user.model'
import { Membership } from '../../../src/modules/project/membership.model'
import { Task } from '../../../src/modules/task/task.model'
import { List } from '../../../src/modules/list/list.model'
import { projectService } from '../../../src/modules/project/project.service'
import { listService } from '../../../src/modules/list/list.service'
import { taskService } from '../../../src/modules/task/task.service'
import { checklistService } from '../../../src/modules/checklist/checklist.service'
import { commentService } from '../../../src/modules/comment/comment.service'

const makeUser = () =>
  User.create({
    name: 'Test User', email: `t${Date.now()}${Math.random()}@x.com`,
    password: 'hash', emailVerified: true,
  })

const setup = async () => {
  const owner = await makeUser()
  const project = await projectService.create(owner.id, 'P')
  return { owner, project }
}

const join = (projectId: string, userId: string, role: 'editor' | 'viewer') =>
  Membership.create({ projectId, userId, role })

// a second list in the project (the three default lists already exist)
const secondList = (ownerId: string, projectId: string) =>
  listService.create(ownerId, projectId, { name: 'Other' })

describe('taskService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => clearTestDb())
  afterAll(async () => disconnectTestDb())

  describe('permissions', () => {
    it('a stranger gets 404 on every action', async () => {
      const { project } = await setup()
      const stranger = await makeUser()
      await expect(taskService.create(stranger.id, project.id, { title: 'x' })).rejects.toThrow(/not found/i)
      await expect(taskService.list(stranger.id, project.id, {})).rejects.toThrow(/not found/i)
    })

    it('a viewer can read but not create, update, move or delete', async () => {
      const { owner, project } = await setup()
      const viewer = await makeUser()
      await join(project.id, viewer.id, 'viewer')
      const t = await taskService.create(owner.id, project.id, { title: 'T' })
      const other = await secondList(owner.id, project.id)

      await expect(taskService.list(viewer.id, project.id, {})).resolves.toHaveLength(1)
      await expect(taskService.create(viewer.id, project.id, { title: 'x' })).rejects.toThrow(/permission/i)
      await expect(taskService.update(viewer.id, project.id, t.id, { title: 'x' })).rejects.toThrow(/permission/i)
      await expect(taskService.move(viewer.id, project.id, t.id, { listId: other.id })).rejects.toThrow(/permission/i)
      await expect(taskService.remove(viewer.id, project.id, t.id)).rejects.toThrow(/permission/i)
    })

    it('an editor can work on tasks', async () => {
      const { project } = await setup()
      const editor = await makeUser()
      await join(project.id, editor.id, 'editor')
      const t = await taskService.create(editor.id, project.id, { title: 'T' })
      await expect(
        taskService.update(editor.id, project.id, t.id, { title: 'U' })
      ).resolves.toMatchObject({ title: 'U' })
    })

    it("a task id from another project is 'not found' even for a member", async () => {
      const a = await setup()
      const b = await setup()
      const taskInB = await taskService.create(b.owner.id, b.project.id, { title: 'B task' })
      await expect(
        taskService.get(a.owner.id, a.project.id, taskInB.id)
      ).rejects.toThrow(/task not found/i)
    })
  })

  describe('lists', () => {
    it('a new task goes to the first default list', async () => {
      const { owner, project } = await setup()
      const t = await taskService.create(owner.id, project.id, { title: 'T' })
      const first = await List.findOne({ projectId: project.id }).sort({ order: 1 })
      expect(t.listId).toBe(first!.id)
    })
    
    it('list includes assignee name, comment count and checklist progress', async () => {
  const { owner, project } = await setup()
  const t = await taskService.create(owner.id, project.id, { title: 'T', assigneeId: owner.id })
  await checklistService.create(owner.id, project.id, t.id, { title: 'A' })
  await commentService.create(owner.id, project.id, t.id, { text: 'hi' })
  const [row] = await taskService.list(owner.id, project.id, {})
  expect(row.assigneeName).toBe('Test User')
  expect(row.commentCount).toBe(1)
  expect(row.progress).toEqual({ done: 0, total: 1, percent: 0 })
})

    it('a list from another project is rejected', async () => {
      const a = await setup()
      const b = await setup()
      const foreign = await List.findOne({ projectId: b.project.id })
      await expect(
        taskService.create(a.owner.id, a.project.id, { title: 'T', listId: foreign!.id })
      ).rejects.toThrow(/list not found/i)
    })
  })

  describe('assignment', () => {
    it('only a project member can be assigned', async () => {
      const { owner, project } = await setup()
      const outsider = await makeUser()
      await expect(
        taskService.create(owner.id, project.id, { title: 'T', assigneeId: outsider.id })
      ).rejects.toThrow(/member/i)

      const member = await makeUser()
      await join(project.id, member.id, 'editor')
      const t = await taskService.create(owner.id, project.id, { title: 'T', assigneeId: member.id })
      expect(t.assigneeId).toBe(member.id)
    })
  })

  describe('ordering', () => {
    it('new tasks append to the bottom of their list', async () => {
      const { owner, project } = await setup()
      const a = await taskService.create(owner.id, project.id, { title: 'A' })
      const b = await taskService.create(owner.id, project.id, { title: 'B' })
      expect(b.order).toBeGreaterThan(a.order)
    })

    it('moving between two neighbors changes ONLY the moved task', async () => {
      const { owner, project } = await setup()
      const a = await taskService.create(owner.id, project.id, { title: 'A' })
      const b = await taskService.create(owner.id, project.id, { title: 'B' })
      const c = await taskService.create(owner.id, project.id, { title: 'C' })

      const moved = await taskService.move(owner.id, project.id, c.id, {
        listId: a.listId, aboveId: a.id, belowId: b.id,
      })

      expect(moved.order).toBeGreaterThan(a.order)
      expect(moved.order).toBeLessThan(b.order)
      const freshA = await Task.findById(a.id)
      const freshB = await Task.findById(b.id)
      expect(freshA?.order).toBe(a.order)
      expect(freshB?.order).toBe(b.order)
    })

    it('moving to another list sets the list', async () => {
      const { owner, project } = await setup()
      const t = await taskService.create(owner.id, project.id, { title: 'T' })
      const other = await secondList(owner.id, project.id)
      const moved = await taskService.move(owner.id, project.id, t.id, { listId: other.id })
      expect(moved.listId).toBe(other.id)
    })

    it('rejects a neighbor from another list', async () => {
      const { owner, project } = await setup()
      const other = await secondList(owner.id, project.id)
      const a = await taskService.create(owner.id, project.id, { title: 'A', listId: other.id })
      const t = await taskService.create(owner.id, project.id, { title: 'T' })
      await expect(
        taskService.move(owner.id, project.id, t.id, { listId: t.listId, aboveId: a.id })
      ).rejects.toThrow(/neighbor/i)
    })

    it('rejects neighbors given in the wrong order', async () => {
      const { owner, project } = await setup()
      const a = await taskService.create(owner.id, project.id, { title: 'A' })
      const b = await taskService.create(owner.id, project.id, { title: 'B' })
      const c = await taskService.create(owner.id, project.id, { title: 'C' })
      await expect(
        taskService.move(owner.id, project.id, c.id, { listId: c.listId, aboveId: b.id, belowId: a.id })
      ).rejects.toThrow(/out of order/i)
    })
  })

  describe('archive', () => {
    it('hides an archived task from the board and restores it in place', async () => {
      const { owner, project } = await setup()
      const t = await taskService.create(owner.id, project.id, { title: 'T' })

      await taskService.archive(owner.id, project.id, t.id)
      expect(await taskService.list(owner.id, project.id, {})).toHaveLength(0)
      expect(await taskService.list(owner.id, project.id, { archived: true })).toHaveLength(1)

      const restored = await taskService.restore(owner.id, project.id, t.id)
      expect(restored.order).toBe(t.order)
      expect(restored.listId).toBe(t.listId)
      expect(await taskService.list(owner.id, project.id, {})).toHaveLength(1)
    })
  })

  describe('project deletion', () => {
    it('deleting a project deletes its tasks and lists', async () => {
      const { owner, project } = await setup()
      await taskService.create(owner.id, project.id, { title: 'T' })
      await projectService.remove(owner.id, project.id)
      expect(await Task.countDocuments({ projectId: project.id })).toBe(0)
      expect(await List.countDocuments({ projectId: project.id })).toBe(0)
    })
  })
})