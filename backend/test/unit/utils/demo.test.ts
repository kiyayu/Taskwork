//test/unit/common/demo.test.ts
import { it, expect } from 'vitest'
import { isDemoEmail } from '../../../src/common/utils/demo'

it('recognises demo accounts only', () => {
  expect(isDemoEmail('ann@demo.test')).toBe(true)
  expect(isDemoEmail('ANN@DEMO.TEST')).toBe(true)
  expect(isDemoEmail('ann@demo.test.evil.com')).toBe(false)
  expect(isDemoEmail('ann@gmail.com')).toBe(false)
  expect(isDemoEmail(undefined)).toBe(false)
})

