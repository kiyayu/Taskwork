//src/components/layout/navFilter.ts
// Hides items the current role may not use. UX only: the server enforces every rule.
export const filterByRole = <T extends { roles?: string[] }>(items: T[], role?: string): T[] =>
  items.filter((i) => !i.roles || (!!role && i.roles.includes(role)))