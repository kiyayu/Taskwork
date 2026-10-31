//src/modules/realtime/realtime.publish.ts
import { hub } from './realtime.hub.js'

export const live = (projectId: string, type: string, extra: { taskId?: string; actorId?: string } = {}) =>
  hub.publish({ type, projectId, ...extra })