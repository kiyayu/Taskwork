//test/integration/realtime/stream.test.ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import { connectTestDb, clearTestDb, disconnectTestDb } from '../../helpers/testDb'
import { hub } from '../../../src/modules/realtime/realtime.hub'
import { live } from '../../../src/modules/realtime/realtime.publish'

describe('SSE delivery', () => {
  beforeAll(async () => connectTestDb())
  beforeEach(async () => { await clearTestDb(); hub.clear() })
  afterAll(async () => disconnectTestDb())

  it('a connected client receives a published event over real HTTP', async () => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/event-stream' })
      res.write(': connected\n\n')
      hub.join('p1', { res: res as any, userId: 'u1' })
      req.on('close', () => hub.leave('p1', { res: res as any, userId: 'u1' }))
    })
    await new Promise<void>((r) => server.listen(0, r))
    const port = (server.address() as AddressInfo).port

    const received = await new Promise<string>((resolve) => {
      http.get({ port, path: '/' }, (res) => {
        let buf = ''
        res.on('data', (chunk) => {
          buf += chunk.toString()
          if (buf.includes('data:')) { res.destroy(); resolve(buf) }
          else if (buf.includes(': connected')) live('p1', 'tasks_changed', { taskId: 't1' })
        })
      })
    })

    expect(received).toContain('"type":"tasks_changed"')
    expect(received).toContain('"taskId":"t1"')
    server.close()
  })
})