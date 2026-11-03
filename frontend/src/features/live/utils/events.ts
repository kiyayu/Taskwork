//src/features/live/utils/events.ts
export type LiveEvent = { type: string; projectId: string; taskId?: string; actorId?: string }

type Key = readonly unknown[]

// Which cached queries does an event make stale? Unknown types return [] and are ignored.
export const keysForEvent = (e: LiveEvent): Key[] => {
  const p = e.projectId
  const feed: Key = ['activity', p]
  switch (e.type) {
    case 'tasks_changed':
    case 'lists_changed':
      return [['board', p, 'tasks'], ['board', p, 'lists'], feed]
    case 'checklist_changed':
      return [['board', p, 'tasks'], ...(e.taskId ? [['board', p, 'checklist', e.taskId]] : [])]
    case 'comments_changed':
      return [['board', p, 'tasks'], ...(e.taskId ? [['board', p, 'comments', e.taskId]] : []), feed]
    case 'attachments_changed':
      return [...(e.taskId ? [['board', p, 'attachments', e.taskId]] : []), feed]
    case 'members_changed':
      return [['members', p], ['board', p, 'tasks'], feed]
    case 'project_changed':
      return [['projects']]
    default:
      return []
  }
}

// Safe parse: a malformed message must never crash the page.
export const parseEvent = (raw: string): LiveEvent | null => {
  try {
    const v = JSON.parse(raw)
    return v && typeof v.type === 'string' && typeof v.projectId === 'string' ? (v as LiveEvent) : null
  } catch {
    return null
  }
}

// Remove duplicates so a burst invalidates each key once.
export const uniqueKeys = (keys: Key[]): Key[] => {
  const seen = new Set<string>()
  return keys.filter((k) => {
    const id = JSON.stringify(k)
    return seen.has(id) ? false : (seen.add(id), true)
  })
}