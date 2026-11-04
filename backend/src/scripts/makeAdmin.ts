//src/scripts/makeAdmin.ts
import mongoose from 'mongoose'
import { env } from '../config/env.js'
import { User } from '../modules/user/user.model.js'

const email = process.argv[2]?.toLowerCase()

async function main() {
  if (!email) throw new Error('Usage: npm run make-admin -- someone@example.com')
  await mongoose.connect(env.mongoUri)
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { returnDocument: 'after' })
  if (!user) throw new Error('No user with that email')
  console.log(`${user.email} is now an admin. They must log out and in again.`)
  await mongoose.disconnect()
}

main().catch(async (e) => { console.error(e.message); await mongoose.disconnect(); process.exit(1) })