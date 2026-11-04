//src/config/paths.ts
export const paths = {
  home: "/",
  contact: "/contact",
  terms: "/terms",
  privacy: "/privacy",
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  price:'price',
  
  app: {
    root: "/app",
    admin: "/app/admin",
    dashboard: "/app/dashboard",
    projects: "/app/projects",
    projectBoard: (id: string) => `/app/projects/${id}`,
    projectMembers: (id: string) => `/app/projects/${id}/members`,
invite: (token: string) => `/app/invite/${token}`, 
     
  },
  settings: {
    root: "/app/settings",
    profile: "/app/settings/profile",
    preferences: "/app/settings/preferences",
    notifications: "/app/settings/notifications",
    account: "/app/settings/account",
    security: "/app/settings/security",
    privacy: "/app/settings/privacy",
  },
} as const