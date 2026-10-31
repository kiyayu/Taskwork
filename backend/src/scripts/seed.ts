//src/scripts/seed.ts
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { User } from '../modules/user/user.model.js'
import { hashPassword } from '../common/utils/password.js'
import { Membership } from '../modules/project/membership.model.js'
import { projectService } from '../modules/project/project.service.js'
import { taskService } from '../modules/task/task.service.js'
import { checklistService } from '../modules/checklist/checklist.service.js'
import { commentService } from '../modules/comment/comment.service.js'
import { List } from '../modules/list/list.model.js'

const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? 'DemoPass123'

const upsertUser = async (name: string, email: string) =>
  (await User.findOne({ email })) ??
  User.create({ name, email, password: await hashPassword(DEMO_PASSWORD), emailVerified: true })

async function main() {
  if (env.nodeEnv === 'production' && process.env.ALLOW_SEED !== 'true') {
    throw new Error('Refusing to seed production. Set ALLOW_SEED=true if you really mean it.')
  }
  await mongoose.connect(env.mongoUri)

  const [ann, sam, lia] = await Promise.all([
    upsertUser('Ann Demo', 'ann@demo.test'),
    upsertUser('Sam Demo', 'sam@demo.test'),
    upsertUser('Lia Demo', 'lia@demo.test'),
  ])

  // idempotent: skip if the demo project already exists
  const existing = await Membership.find({ userId: ann.id, role: 'owner' }).populate('projectId')
  if (existing.some((m: any) => m.projectId?.name === 'Launch plan')) {
    console.log('Demo data already present.')
    return mongoose.disconnect()
  }

  const project = await projectService.create(ann.id, 'Launch plan')
  await Membership.create({ projectId: project.id, userId: sam.id, role: 'editor' })
  await Membership.create({ projectId: project.id, userId: lia.id, role: 'viewer' })

  const lists = await List.find({ projectId: project.id }).sort({ order: 1 })
  const [todo, doing, done] = lists.map((l) => l.id)

  const mk = (title: string, listId: string, extra = {}) =>
    taskService.create(ann.id, project.id, { title, listId, ...extra })

  const design = await mk('Design landing page', doing, { priority: 1, assigneeId: sam.id })
  await mk('Write launch email', todo, { priority: 2 })
  await mk('Set up analytics', todo, { priority: 3, assigneeId: ann.id })
  await mk('Register domain', done)

  for (const title of ['Wireframes', 'Pick colors', 'Hero copy']) {
    await checklistService.create(ann.id, project.id, design.id, { title })
  }
  await commentService.create(sam.id, project.id, design.id, {
    text: '@Ann wireframes are ready for review', mentions: [ann.id],
  })

  console.log(`Seeded. Log in as ann@demo.test / ${DEMO_PASSWORD}`)
  await mongoose.disconnect()
}

main().catch(async (e) => { console.error(e); await mongoose.disconnect(); process.exit(1) })