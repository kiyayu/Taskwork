//src/features/board/checklist/utils/tree.test.ts
import { describe, it, expect } from 'vitest'
import { buildChecklistTree } from './tree'
import type { ChecklistItem } from '../types'

const item = (id: string, parentId: string | null, order: number): ChecklistItem => ({
  id, taskId: 't', parentId, title: id, completed: false, order,
})

describe('buildChecklistTree', () => {
  it('nests sub-items under their parent, each level in order', () => {
    const tree = buildChecklistTree([item('b', null, 2), item('a', null, 1), item('a2', 'a', 2), item('a1', 'a', 1)])
    expect(tree.map((n) => n.item.id)).toEqual(['a', 'b'])
    expect(tree[0].children.map((c) => c.id)).toEqual(['a1', 'a2'])
    expect(tree[1].children).toEqual([])
  })
  it('drops sub-items whose parent is missing', () => {
    expect(buildChecklistTree([item('x', 'gone', 1)])).toEqual([])
  })
  it('is empty for no items', () => {
    expect(buildChecklistTree([])).toEqual([])
  })
})