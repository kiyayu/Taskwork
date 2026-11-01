//src/features/projects/schemas/project.schema.test.ts
import { describe, it, expect } from 'vitest'
import { i18n } from '@/lib/i18n'
import { projectNameSchema } from './project.schema'

describe('projectNameSchema', () => {
  it('accepts a normal name and trims it', () => {
    const r = projectNameSchema.safeParse({ name: '  Launch plan  ' })
    expect(r.success && r.data.name).toBe('Launch plan')
  })

  it('rejects empty and too long names with real translation keys', () => {
    for (const name of ['   ', 'x'.repeat(101)]) {
      const r = projectNameSchema.safeParse({ name })
      expect(r.success).toBe(false)
      if (!r.success) expect(i18n.exists(r.error.issues[0].message)).toBe(true)
    }
  })
})