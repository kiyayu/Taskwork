//src/lib/i18n/locales/en/admin.ts
export const admin = {
  title: 'Admin',
  description: 'System overview and user management. Project contents are never shown here.',
  loadFailed: 'Could not load the admin data.',
  stats: {
    users: 'Users', verified: 'Verified', active: 'Active', newWeek: 'New this week',
    projects: 'Projects', tasks: 'Active tasks', archived: 'Archived tasks', comments: 'Comments', files: 'Files',
    plans: 'Users by plan', signups: 'Sign-ups, last 14 days',
  },
  users: {
    title: 'Users', search: 'Search by name or email', empty: 'No users found.',
    name: 'User', plan: 'Plan', status: 'Status', projects: 'Projects owned', joined: 'Joined', actions: 'Actions',
    active: 'Active', inactive: 'Deactivated', admin: 'Admin',
    changePlan: 'Plan for {{name}}', free: 'Free', pro: 'Pro',
    deactivate: 'Deactivate', activate: 'Reactivate',
    deactivateTitle: 'Deactivate this user?',
    deactivateDescription: 'They are signed out everywhere and cannot log in until reactivated.',
    updated: 'User updated',
    previous: 'Previous', next: 'Next', pageOf: 'Page {{current}} of {{total}}',
  },
} as const