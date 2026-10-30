//src/modules/project/project.permissions.ts
export const ROLES = ['owner', 'editor', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export type Action =
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'member:invite'
  | 'member:remove'
  | 'task:create'
  | 'task:update'
  | 'task:delete'
  | 'comment:create'
  | 'list:create' | 'list:update' | 'list:delete'
 
const MATRIX: Record<Role, readonly Action[]> = {
  viewer: ['project:read'],
  editor: ['project:read', 'task:create', 'task:update', 'task:delete','list:create', 'list:update', 'comment:create'],
  owner: [
    'project:read', 'project:update', 'project:delete',
    'member:invite', 'member:remove',
    'task:create', 'task:update', 'task:delete', 'comment:create', 'list:create', 'list:update', 'list:delete',
  ],
}

export const can = (role: Role | null | undefined, action: Action): boolean =>
  !!role && MATRIX[role].includes(action)