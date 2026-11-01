//src/features/projects/types/project.types.ts
export type ProjectRole = 'owner' | 'editor' | 'viewer'

export type Project = {
  id: string
  name: string
  role: ProjectRole
  createdAt: string
}