//src/modules/realtime/realtime.controller.ts
import { Request, Response } from 'express'
import { projectService } from '../project/project.service.js'
import { hub } from './realtime.hub.js'

const HEARTBEAT_MS = 25_000

export const realtimeController = {
  // GET /api/projects/:projectId/stream
  stream: async (req: Request, res: Response) => {
    const { projectId } = req.data?.params as { projectId: string }
    // same guard as every endpoint: strangers get 404, never a stream
    await projectService.assertCan(req.user!.id, projectId, 'project:read')

    // NEW: the browser may have disconnected while we were checking permissions.
    // Without this guard we would join a dead connection and never clean it up.
    if (req.destroyed || res.writableEnded) return

    res.status(200).set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform', // no-transform: compression would buffer the stream
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // tell proxies (nginx) not to buffer
    })
    res.flushHeaders()
    res.write(': connected\n\n')

    const client = { res, userId: req.user!.id }
    hub.join(projectId, client)

    // comments keep idle connections alive through proxies
    // NEW: try/catch, because writing to a closed socket can throw inside a timer
    const beat = setInterval(() => {
      try { res.write(': ping\n\n') } catch { cleanup() }
    }, HEARTBEAT_MS)

    const cleanup = () => {
      clearInterval(beat)
      hub.leave(projectId, client)
    }

    req.on('close', cleanup)
  },
}