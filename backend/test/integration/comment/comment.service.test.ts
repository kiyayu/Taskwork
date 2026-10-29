//test/integration/comment/comment.service.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { User } from '../../../src/modules/user/user.model'
import { Membership } from '../../../src/modules/project/membership.model'
import { Notification } from '../../../src/modules/notification/notification.model'
import { projectService } from '../../../src/modules/project/project.service'
import { taskService } from '../../../src/modules/task/task.service'
import { commentService } from '../../../src/modules/comment/comment.service'

const makeUser = (name = 'Test User') =>
  User.create({ name, email: `t${Date.now()}${Math.random()}@x.com`, password: 'hash', emailVerified: true })

const setup = async () => {
  const owner = await makeUser('Owner')
  const project = await projectService.create(owner.id, 'P')
  const task = await taskService.create(owner.id, project.id, { title: 'T' })
  return { owner, project, task }
}

describe('commentService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => clearTestDb())
  afterAll(async () => disconnectTestDb())

  it('a viewer cannot comment, an editor can', async () => {
    const { project, task } = await setup()
    const viewer = await makeUser(); const editor = await makeUser()
    await Membership.create({ projectId: project.id, userId: viewer.id, role: 'viewer' })
    await Membership.create({ projectId: project.id, userId: editor.id, role: 'editor' })

    await expect(commentService.create(viewer.id, project.id, task.id, { text: 'hi' })).rejects.toThrow(/permission/i)
    await expect(commentService.create(editor.id, project.id, task.id, { text: 'hi' })).resolves.toMatchObject({ text: 'hi' })
  })

  it('a stranger gets 404', async () => {
    const { project, task } = await setup()
    const stranger = await makeUser()
    await expect(commentService.list(stranger.id, project.id, task.id)).rejects.toThrow(/not found/i)
  })

  it('mentioning a project member creates a notification', async () => {
    const { owner, project, task } = await setup()
    const member = await makeUser('Sara')
    await Membership.create({ projectId: project.id, userId: member.id, role: 'editor' })

    await commentService.create(owner.id, project.id, task.id, { text: '@Sara look', mentions: [member.id] })

    const n = await Notification.findOne({ userId: member.id, type: 'mentioned' })
    expect(n).not.toBeNull()
  })

  it('refuses to mention someone outside the project', async () => {
    const { owner, project, task } = await setup()
    const outsider = await makeUser()
    await expect(
      commentService.create(owner.id, project.id, task.id, { text: 'x', mentions: [outsider.id] })
    ).rejects.toThrow(/mention/i)
  })

  it('does not notify you for mentioning yourself', async () => {
    const { owner, project, task } = await setup()
    await commentService.create(owner.id, project.id, task.id, { text: 'me', mentions: [owner.id] })
    expect(await Notification.countDocuments({ userId: owner.id, type: 'mentioned' })).toBe(0)
  })

  it('only the author or an owner can delete a comment', async () => {
    const { owner, project, task } = await setup()
    const a = await makeUser(); const b = await makeUser()
    await Membership.create({ projectId: project.id, userId: a.id, role: 'editor' })
    await Membership.create({ projectId: project.id, userId: b.id, role: 'editor' })
    const c = await commentService.create(a.id, project.id, task.id, { text: 'mine' })

    await expect(commentService.remove(b.id, project.id, task.id, c.id)).rejects.toThrow(/permission/i)
    await expect(commentService.remove(owner.id, project.id, task.id, c.id)).resolves.toBeUndefined()
  })

  it('deleting a task deletes its comments', async () => {
    const { owner, project, task } = await setup()
    await commentService.create(owner.id, project.id, task.id, { text: 'x' })
    await taskService.remove(owner.id, project.id, task.id)
    await expect(commentService.list(owner.id, project.id, task.id)).rejects.toThrow(/not found/i)
  })
})