//src/features/auth/utils/demo.ts
export type DemoCredentials = { email: string; password: string }

// null means "no demo configured": the button is not rendered.
export const getDemoCredentials = (e: { demoEmail?: string; demoPassword?: string }): DemoCredentials | null =>
  e.demoEmail && e.demoPassword ? { email: e.demoEmail, password: e.demoPassword } : null
