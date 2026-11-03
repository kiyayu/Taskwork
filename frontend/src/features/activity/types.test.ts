//src/features/activity/types.test.ts
import { it, expect } from 'vitest'
import { i18n } from '@/lib/i18n'
import { ACTIVITY_TYPES } from './types'

// Every activity type the server can send must have a sentence, or the UI shows a raw key.
it('has a locale sentence for every activity type', () => {
  for (const type of ACTIVITY_TYPES) expect(i18n.exists(`activity:type.${type}`), type).toBe(true)
})