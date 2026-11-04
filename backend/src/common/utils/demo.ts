//src/common/utils/demo.ts
import { ApiError } from '../errors/apiErrors.js'

// The public demo accounts (seed script) must not be locked out or hijacked by a visitor.
export const isDemoEmail = (email?: string): boolean => !!email && email.toLowerCase().endsWith('@demo.test')

export const assertNotDemo = (email?: string): void => {
  if (isDemoEmail(email)) throw ApiError.forbidden('The demo account cannot be changed')
}