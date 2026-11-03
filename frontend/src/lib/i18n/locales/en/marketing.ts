//src/lib/i18n/locales/en/marketing.ts
export const marketing = {
  tagline: 'Plan work together on boards that update live.',
  hero: {
    title: 'Plan projects with your team, on one live board',
    description:
      'Create lists, drag tasks between them, break work into checklists, and talk it through in comments. Everyone sees changes as they happen.',
    primary: 'Get started',
    secondary: 'Log in',
    demoHint: 'No sign-up needed: open the shared demo project in one click.',
  },
  features: {
    title: 'Everything a small team needs',
    items: [
      { title: 'Boards you shape', description: 'Create your own lists and drag tasks between them. Every move is saved in one request.', icon: 'layers' },
      { title: 'Live for everyone', description: 'When a teammate moves a card or comments, your board updates without a refresh.', icon: 'radio' },
      { title: 'Roles that are enforced', description: 'Owners, editors and viewers. Every rule is checked on the server, not just hidden in the interface.', icon: 'shield' },
      { title: 'Join by link', description: 'Invite people with an expiring link and the role you choose. No hunting for email addresses.', icon: 'users' },
      { title: 'Checklists with progress', description: 'Break a task into items and sub-items. Progress shows on the card.', icon: 'zap' },
      { title: 'Comments and files', description: 'Mention teammates, get notified, and attach files straight to a task.', icon: 'message' },
    ],
  },
  cta: {
    title: 'Ready to plan your next project?',
    description: 'Create an account in under a minute.',
    button: 'Create account',
  },
  contact: {
    title: 'Contact',
    description: 'Questions, feedback or support requests.',
    body: 'Email us and we will reply as soon as we can.',
  },
} as const