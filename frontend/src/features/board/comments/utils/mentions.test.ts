//src/features/board/comments/utils/mentions.test.ts
import { describe, it, expect } from 'vitest'
import { insertMention, resolveMentions, splitMentions } from './mentions'

const members = [
  { userId: '1', name: 'Ann' },
  { userId: '2', name: 'Ann Demo' },
  { userId: '3', name: 'Sam' },
]

describe('insertMention', () => {
  it('adds the mention with correct spacing', () => {
    expect(insertMention('', 'Sam')).toBe('@Sam ')
    expect(insertMention('hi', 'Sam')).toBe('hi @Sam ')
    expect(insertMention('hi ', 'Sam')).toBe('hi @Sam ')
  })
})

describe('resolveMentions', () => {
  it('returns only members still mentioned in the text', () => {
    expect(resolveMentions('hello @Sam', members)).toEqual(['3'])
    expect(resolveMentions('no mentions', members)).toEqual([])
  })
  it('does not count "Ann" when the text says "Ann Demo"', () => {
    expect(resolveMentions('ping @Ann Demo please', members)).toEqual(['2'])
  })
  it('counts both when both are written', () => {
    expect(resolveMentions('@Ann Demo and @Ann', members).sort()).toEqual(['1', '2'])
  })
})

describe('splitMentions', () => {
  it('marks mention parts and keeps the rest', () => {
    expect(splitMentions('hi @Sam, look', ['Sam'])).toEqual([
      { text: 'hi ', mention: false },
      { text: '@Sam', mention: true },
      { text: ', look', mention: false },
    ])
  })
  it('prefers the longest name', () => {
    expect(splitMentions('@Ann Demo', ['Ann', 'Ann Demo'])).toEqual([{ text: '@Ann Demo', mention: true }])
  })
  it('returns the text untouched with no names, and survives regex characters in names', () => {
    expect(splitMentions('a', [])).toEqual([{ text: 'a', mention: false }])
    expect(splitMentions('x @A.B y', ['A.B'])[1]).toEqual({ text: '@A.B', mention: true })
  })
})