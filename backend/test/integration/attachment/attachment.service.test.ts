//test/integration/attachment/attachment.service.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest'
vi.hoisted(() => { process.env.STORAGE_DRIVER = 'fake' })

import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { User } from '../../../src/modules/user/user.model'
import { Membership } from '../../../src/modules/project/membership.model'
import { Attachment } from '../../../src/modules/attachment/attachment.model'
import { projectService } from '../../../src/modules/project/project.service'
import { taskService } from '../../../src/modules/task/task.service'
import { attachmentService } from '../../../src/modules/attachment/attachment.service'
import { uploadService } from '../../../src/modules/upload/upload.service'
import { fakeStorage } from '../../../src/modules/upload/storage'

const makeUser = () =>
  User.create({ name: 'T', email: `t${Date.now()}${Math.random()}@x.com`, password: 'hash', emailVerified: true })

const setup = async () => {
  const owner = await makeUser()
  const project = await projectService.create(owner.id, 'P')
  const task = await taskService.create(owner.id, project.id, { title: 'T' })
  return { owner, project, task }
}

// pretend the browser signed and uploaded a file
const stage = (userId: string, over: Partial<{ bytes: number; format: string }> = {}) => {
  const { fileKey } = uploadService.sign(userId, { purpose: 'attachment', contentType: 'application/pdf', size: 1000 })
  fakeStorage.simulateUpload(fileKey, { bytes: 1000, format: 'pdf', url: `https://cdn/${fileKey}.pdf`, ...over })
  return fileKey
}

describe('attachmentService', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => { await clearTestDb(); fakeStorage.files.clear() })
  afterAll(async () => disconnectTestDb())

  it('attaches a confirmed file and stores the url from storage', async () => {
    const { owner, project, task } = await setup()
    const key = stage(owner.id)
    const a = await attachmentService.create(owner.id, project.id, task.id, { fileKey: key, name: 'spec.pdf' })
    expect(a.url).toBe(`https://cdn/${key}.pdf`)
    expect(a.name).toBe('spec.pdf')
  })

  it('a viewer cannot attach; a stranger gets 404', async () => {
    const { owner, project, task } = await setup()
    const viewer = await makeUser(); const stranger = await makeUser()
    await Membership.create({ projectId: project.id, userId: viewer.id, role: 'viewer' })
    await expect(
      attachmentService.create(viewer.id, project.id, task.id, { fileKey: stage(viewer.id), name: 'x' })
    ).rejects.toThrow(/permission/i)
    await expect(attachmentService.list(stranger.id, project.id, task.id)).rejects.toThrow(/not found/i)
    expect(owner.id).toBeTruthy()
  })

  it("refuses someone else's uploaded file", async () => {
    const { owner, project, task } = await setup()
    const editor = await makeUser()
    await Membership.create({ projectId: project.id, userId: editor.id, role: 'editor' })
    const key = stage(owner.id)
    await expect(
      attachmentService.create(editor.id, project.id, task.id, { fileKey: key, name: 'x' })
    ).rejects.toThrow(/not found/i)
  })

  it('refuses and deletes a file that breaks the rules', async () => {
    const { owner, project, task } = await setup()
    const key = stage(owner.id, { bytes: 50 * 1024 * 1024 })
    await expect(
      attachmentService.create(owner.id, project.id, task.id, { fileKey: key, name: 'big' })
    ).rejects.toThrow(/too large/i)
    expect(fakeStorage.files.has(key)).toBe(false)
  })

  it('the same file cannot be attached twice', async () => {
    const { owner, project, task } = await setup()
    const key = stage(owner.id)
    await attachmentService.create(owner.id, project.id, task.id, { fileKey: key, name: 'a' })
    await expect(
      attachmentService.create(owner.id, project.id, task.id, { fileKey: key, name: 'a' })
    ).rejects.toThrow()
  })

  it('only the uploader or the owner can delete, and the file leaves storage', async () => {
    const { owner, project, task } = await setup()
    const a = await makeUser(); const b = await makeUser()
    await Membership.create({ projectId: project.id, userId: a.id, role: 'editor' })
    await Membership.create({ projectId: project.id, userId: b.id, role: 'editor' })
    const key = stage(a.id)
    const att = await attachmentService.create(a.id, project.id, task.id, { fileKey: key, name: 'mine' })

    await expect(attachmentService.remove(b.id, project.id, task.id, att.id)).rejects.toThrow(/permission/i)
    await attachmentService.remove(owner.id, project.id, task.id, att.id)
    await new Promise((r) => setTimeout(r, 10))
    expect(fakeStorage.files.has(key)).toBe(false)
  })

  it('deleting a task deletes its attachments and files', async () => {
    const { owner, project, task } = await setup()
    const key = stage(owner.id)
    await attachmentService.create(owner.id, project.id, task.id, { fileKey: key, name: 'a' })
    await taskService.remove(owner.id, project.id, task.id)
    await new Promise((r) => setTimeout(r, 10))
    expect(await Attachment.countDocuments({ taskId: task.id })).toBe(0)
    expect(fakeStorage.files.has(key)).toBe(false)
  })
})