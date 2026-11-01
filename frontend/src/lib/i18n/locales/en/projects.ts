//src/lib/i18n/locales/en/projects.ts
export const projects = {
  title: 'Projects',
  description: 'Boards you own or have been invited to.',
  create: 'New project',
  empty: 'You have no projects yet. Create your first one.',
  loadFailed: 'Could not load your projects.',
  role: { owner: 'Owner', editor: 'Editor', viewer: 'Viewer' },
  createdOn: 'Created {{date}}',
  form: {
    name: 'Project name',
    namePlaceholder: 'For example: Launch plan',
    createTitle: 'Create project',
    createSubmit: 'Create',
    renameTitle: 'Rename project',
    renameSubmit: 'Save',
  },
  actions: { rename: 'Rename', delete: 'Delete', menu: 'Project actions' },
  delete: {
    title: 'Delete this project?',
    description: 'All lists, tasks, comments and files in it will be permanently deleted.',
    confirm: 'Delete project',
    word: 'DELETE',
  },
  toast: { created: 'Project created', renamed: 'Project renamed', deleted: 'Project deleted' },
} as const