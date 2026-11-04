//src/components/layout/navFilter.test.ts
import { it, expect } from 'vitest'
import { filterByRole } from './navFilter'

const items = [{ id: 'a' }, { id: 'b', roles: ['admin'] }]
it('shows role-gated items only to that role', () => {
  expect(filterByRole(items, 'admin').map((i) => i.id)).toEqual(['a', 'b'])
  expect(filterByRole(items, 'customer').map((i) => i.id)).toEqual(['a'])
  expect(filterByRole(items, undefined).map((i) => i.id)).toEqual(['a'])
})