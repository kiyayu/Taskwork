//src/features/board/attachments/utils/fileKind.ts
export type FileKind = 'image' | 'pdf' | 'other'

const IMAGE = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif']
const ext = (s: string) => /\.([a-z0-9]+)$/i.exec(s)?.[1].toLowerCase() ?? ''

// Decided by the file extension of the stored URL (falling back to the display name).
export const fileKind = (url: string, name: string): FileKind => {
  let path = url
  try { path = new URL(url).pathname } catch { /* keep the raw string */ }
  const e = ext(path) || ext(name)
  if (e === 'pdf') return 'pdf'
  return IMAGE.includes(e) ? 'image' : 'other'
}

// A stored javascript: or data: URL must never become a link or an iframe source.
export const isSafeUrl = (url: string): boolean => url.startsWith('https://')
