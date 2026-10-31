//src/modules/realtime/realtime.hub.ts
import type { Response } from 'express'

export type LiveEvent = {
  type: string
  projectId: string
  taskId?: string
  actorId?: string
}

type Client = { res: Response; userId: string }

const rooms = new Map<string, Set<Client>>()

export const hub = {
  join(projectId: string, client: Client) {
    if (!rooms.has(projectId)) rooms.set(projectId, new Set())
    rooms.get(projectId)!.add(client)
  },
  leave(projectId: string, client: Client) {
    const room = rooms.get(projectId)
    room?.delete(client)
    if (room && room.size === 0) rooms.delete(projectId)
  },
  // never throws: a dead socket must not break the request that triggered the event
  publish(event: LiveEvent) {
    const room = rooms.get(event.projectId)
    if (!room) return
    const payload = `data: ${JSON.stringify(event)}\n\n`
    for (const c of room) {
      try { c.res.write(payload) } catch { room.delete(c) }
    }
    if (room.size === 0) rooms.delete(event.projectId) // NEW: don't leave empty rooms behind
  },
  // when a member is removed, close their stream
  kick(projectId: string, userId: string) {
    const room = rooms.get(projectId)
    if (!room) return
    for (const c of room) {
      if (c.userId === userId) { try { c.res.end() } catch { /* already closed */ } room.delete(c) }
    }
    if (room.size === 0) rooms.delete(projectId) // NEW
  },
  // NEW: when a project is deleted, close every stream in it
  closeRoom(projectId: string) {
    const room = rooms.get(projectId)
    if (!room) return
    for (const c of room) {
      try { c.res.end() } catch { /* already closed */ }
    }
    rooms.delete(projectId)
  },
  size: (projectId: string) => rooms.get(projectId)?.size ?? 0,
  clear: () => rooms.clear(),
}