//src/lib/i18n/locales/en/dashboard.ts
export const dashboard = {
  title: 'Dashboard',
  greeting: 'Welcome back, {{name}}',
  description: 'Your work across all projects.',
  loadFailed: 'Could not load your overview.',
  cards: { projects: 'Projects', assigned: 'Assigned to me', dueSoon: 'Due in 7 days', overdue: 'Overdue' },
  tasks: {
    title: 'My tasks',
    empty: 'Nothing is assigned to you right now.',
    noDue: 'No due date',
    due: 'Due {{date}}',
    inProject: 'in {{name}}',
  },
  goProjects: 'Go to projects',
} as const