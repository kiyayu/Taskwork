//test/integration/chat/chat.service.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest'
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { User } from '../../../src/modules/user/user.model'
import { Membership } from '../../../src/modules/project/membership.model'
import { projectService } from '../../../src/modules/project/project.service'
import { taskService } from '../../../src/modules/task/task.service'
import { chatService } from '../../../src/modules/chat/chat.service'
import { ChatMessage } from '../../../src/modules/chat/chat.model'
import { hub } from '../../../src/modules/realtime/realtime.hub'

const makeUser = (name = 'Ann') =>
  User.create({ name, email: `t${Date.now()}${Math.random()}@x.com`, password: 'hash', emailVerified: true })

const setup = async () => {
  const owner = await makeUser('Ann')
  const project = await projectService.create(owner.id, 'P')
  const task = await taskService.create(owner.id, project.id, { title: 'T' })
  return { owner, project, task }
}

const addMember = async (projectId: string, role: 'editor' | 'viewer', name = 'Ben') => {
  const user = await makeUser(name)
  await Membership.create({ projectId, userId: user.id, role })
  return user
}

describe('chatService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => { await clearTestDb(); hub.clear() })
  afterAll(async () => disconnectTestDb())

  it('sends a message and lists it with the author name', async () => {
    const { owner, project, task } = await setup()
    const sent = await chatService.send(owner.id, project.id, task.id, { text: 'hello' })
    expect(sent).toMatchObject({ text: 'hello', authorName: 'Ann', taskId: task.id })

    const page = await chatService.list(owner.id, project.id, task.id, {})
    expect(page.items).toHaveLength(1)
    expect(page.items[0]).toMatchObject({ text: 'hello', authorName: 'Ann' })
    expect(page.nextBefore).toBeNull()
  })

  it('a viewer can read but not write, an editor can write', async () => {
    const { owner, project, task } = await setup()
    await chatService.send(owner.id, project.id, task.id, { text: 'hi' })

    const viewer = await addMember(project.id, 'viewer')
    const read = await chatService.list(viewer.id, project.id, task.id, {})
    expect(read.items).toHaveLength(1)
    await expect(chatService.send(viewer.id, project.id, task.id, { text: 'x' })).rejects.toThrow(/permission/i)

    const editor = await addMember(project.id, 'editor', 'Cara')
    await expect(chatService.send(editor.id, project.id, task.id, { text: 'ok' })).resolves.toMatchObject({
      authorName: 'Cara',
    })
  })

  it('a stranger gets 404 on send and list', async () => {
    const { project, task } = await setup()
    const stranger = await makeUser('Eve')
    await expect(chatService.send(stranger.id, project.id, task.id, { text: 'x' })).rejects.toThrow(/not found/i)
    await expect(chatService.list(stranger.id, project.id, task.id, {})).rejects.toThrow(/not found/i)
  })

  it('a task from another project is "not found"', async () => {
    const { owner, project } = await setup()
    const otherOwner = await makeUser('Zed')
    const otherProject = await projectService.create(otherOwner.id, 'Other')
    const otherTask = await taskService.create(otherOwner.id, otherProject.id, { title: 'Secret' })

    await expect(chatService.send(owner.id, project.id, otherTask.id, { text: 'x' })).rejects.toThrow(/not found/i)
    await expect(chatService.list(owner.id, project.id, otherTask.id, {})).rejects.toThrow(/not found/i)
  })

  it('pages with a cursor: newest page first, oldest-first inside, no repeats', async () => {
    const { owner, project, task } = await setup()
    for (let i = 0; i < 5; i++) {
      await chatService.send(owner.id, project.id, task.id, { text: `m${i}` })
    }

    const p1 = await chatService.list(owner.id, project.id, task.id, { limit: 3 })
    expect(p1.items.map((m) => m.text)).toEqual(['m2', 'm3', 'm4'])
    expect(p1.nextBefore).not.toBeNull()

    const p2 = await chatService.list(owner.id, project.id, task.id, { limit: 3, before: p1.nextBefore! })
    expect(p2.items.map((m) => m.text)).toEqual(['m0', 'm1'])
    expect(p2.nextBefore).toBeNull()
  })

  it('authors delete their own message, others cannot, the owner can delete any', async () => {
    const { owner, project, task } = await setup()
    const editor = await addMember(project.id, 'editor')
    const other = await addMember(project.id, 'editor', 'Cara')

    const mine = await chatService.send(editor.id, project.id, task.id, { text: 'mine' })
    await expect(chatService.remove(other.id, project.id, task.id, mine.id)).rejects.toThrow(/permission/i)
    await expect(chatService.remove(editor.id, project.id, task.id, mine.id)).resolves.toBeUndefined()

    const theirs = await chatService.send(editor.id, project.id, task.id, { text: 'theirs' })
    await expect(chatService.remove(owner.id, project.id, task.id, theirs.id)).resolves.toBeUndefined()
    expect(await ChatMessage.countDocuments({ taskId: task.id })).toBe(0)
  })

  it('publishes a live event to the project room after sending and deleting', async () => {
    const { owner, project, task } = await setup()
    const res = { write: vi.fn(), end: vi.fn() } as any
    hub.join(project.id, { res, userId: owner.id })

    const sent = await chatService.send(owner.id, project.id, task.id, { text: 'ping' })
    expect(res.write).toHaveBeenCalledTimes(1)
    expect(res.write.mock.calls[0][0]).toContain('"type":"messages_changed"')
    expect(res.write.mock.calls[0][0]).toContain(`"taskId":"${task.id}"`)

    await chatService.remove(owner.id, project.id, task.id, sent.id)
    expect(res.write).toHaveBeenCalledTimes(2)
  })

  it('removeForTask and removeForProject clean up', async () => {
    const { owner, project, task } = await setup()
    await chatService.send(owner.id, project.id, task.id, { text: 'a' })
    await chatService.removeForTask(task.id)
    expect(await ChatMessage.countDocuments({ taskId: task.id })).toBe(0)

    await chatService.send(owner.id, project.id, task.id, { text: 'b' })
    await chatService.removeForProject(project.id)
    expect(await ChatMessage.countDocuments({ projectId: project.id })).toBe(0)
  })
})