//src/features/live/utils/events.test.ts
import { describe, it, expect } from 'vitest'
import { keysForEvent, parseEvent, uniqueKeys } from './events'

describe('keysForEvent', () => {
  it('task and list changes refresh the board', () => {
    expect(keysForEvent({ type: 'tasks_changed', projectId: 'p' })).toEqual([['board','p','tasks'], ['board','p','lists'], ['activity','p']])
  })
 
  it('member changes refresh members and assignee names', () => {
    expect(keysForEvent({ type: 'members_changed', projectId: 'p' })).toEqual([['members','p'], ['board','p','tasks'], ['activity','p']])
  })
  it('ignores unknown events', () => {
    expect(keysForEvent({ type: 'messages_changed', projectId: 'p' })).toEqual([])
  })
})

describe('parseEvent', () => {
  it('parses a valid message', () => {
    expect(parseEvent('{"type":"x","projectId":"p"}')).toEqual({ type: 'x', projectId: 'p' })
  })
  it('rejects garbage without throwing', () => {
    for (const bad of ['', 'nope', '{}', '{"type":1}', 'null']) expect(parseEvent(bad)).toBeNull()
  })
})

describe('uniqueKeys', () => {
  it('removes duplicates', () => {
    expect(uniqueKeys([['a'], ['b'], ['a']])).toEqual([['a'], ['b']])
  })
})
