//src/features/board/comments/utils/mentions.ts
export type Mentionable = { userId: string; name: string }

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const longestFirst = <T extends { name: string }>(list: T[]) => [...list].sort((a, b) => b.name.length - a.name.length)

// Adds "@Name " at the end, with a space before it when needed.
export const insertMention = (text: string, name: string): string =>
  `${text}${text === '' || /\s$/.test(text) ? '' : ' '}@${name} `

// Which members are still mentioned in the final text? Longest names first; each match is
// removed from a working copy, so "@Ann Demo" does not also count as "@Ann".
export const resolveMentions = (text: string, members: Mentionable[]): string[] => {
  let rest = text
  const ids: string[] = []
  for (const m of longestFirst(members)) {
    const tag = `@${m.name}`
    if (rest.includes(tag)) {
      ids.push(m.userId)
      rest = rest.split(tag).join(' ')
    }
  }
  return ids
}

export type TextPart = { text: string; mention: boolean }

// Splits a comment into plain and mention parts, for highlighting. Output is rendered as React text, never as HTML.
export const splitMentions = (text: string, names: string[]): TextPart[] => {
  if (names.length === 0) return [{ text, mention: false }]
  const sorted = [...names].sort((a, b) => b.length - a.length)
  const re = new RegExp(`(@(?:${sorted.map(escapeRegExp).join('|')}))`)
  // with one capture group, split puts the matches at the odd indexes
  return text
    .split(re)
    .map((part, i) => ({ text: part, mention: i % 2 === 1 }))
    .filter((p) => p.text !== '')
}