//src/features/board/attachments/utils/fileKind.test.ts
import { describe, it, expect } from 'vitest'
import { fileKind, isSafeUrl } from './fileKind'

describe('fileKind', () => {
  it('recognises pdf and images from the URL', () => {
    expect(fileKind('https://res.cloudinary.com/x/image/upload/v1/attachment/u/k.pdf', 'a')).toBe('pdf')
    expect(fileKind('https://res.cloudinary.com/x/image/upload/v1/attachment/u/k.PNG', 'a')).toBe('image')
  })
  it('ignores a query string and falls back to the name', () => {
    expect(fileKind('https://h/x.pdf?sig=1', 'a')).toBe('pdf')
    expect(fileKind('https://h/noext', 'photo.webp')).toBe('image')
  })
  it('treats everything else as a plain link', () => {
    expect(fileKind('https://h/x.mp4', 'v.mp4')).toBe('other')
  })
})

describe('isSafeUrl', () => {
  it('allows https only', () => {
    expect(isSafeUrl('https://a.b/c')).toBe(true)
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'http://a.b', '//a.b']) expect(isSafeUrl(bad)).toBe(false)
  })
})