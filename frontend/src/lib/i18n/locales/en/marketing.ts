// src/lib/i18n/locales/en/marketing.ts
export const marketing = {
  tagline: 'A live project board for small teams.',
  hero: {
    title: 'Plan your team\'s work on one live board',
    description:
      'Make lists, drag tasks between them, add checklists and comments, and see your teammates\' changes the moment they happen. No refreshing, no lost messages.',
    primary: 'Get started free',
    secondary: 'Log in',
    demoHint: 'Want to look around first? Try the demo. No sign-up needed.',
  },
  features: {
    title: 'What you get',
    items: [
      { title: 'Boards that fit your work', description: 'Create your own lists, like Backlog, Doing and Review, and drag tasks between them.', icon: 'layers' },
      { title: 'Updates as they happen', description: 'When a teammate moves a card or leaves a comment, your board changes on its own.', icon: 'radio' },
      { title: 'The right access for everyone', description: 'Give people the owner, editor or viewer role. The server checks it on every request.', icon: 'shield' },
      { title: 'Invite with a link', description: 'Send a link that expires and picks the role for you. No need to collect email addresses.', icon: 'users' },
      { title: 'Checklists with progress', description: 'Split a task into steps and sub-steps. The card shows how far along you are.', icon: 'zap' },
      { title: 'Comments and files', description: 'Mention a teammate to notify them, and attach images or PDFs right on the task.', icon: 'message' },
    ],
  },
  cta: {
    title: 'Start your first board today',
    description: 'It takes about a minute to sign up, and you can invite your team right away.',
    button: 'Create your account',
  },
  contact: {
    title: 'Contact',
    description: 'Questions, ideas or problems? We read every message.',
    body: 'Send us an email and we will get back to you as soon as we can.',
  },
} as const