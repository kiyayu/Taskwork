# Kit

A private full-stack starter: React + Vite frontend, Express + Mongo backend.
Clone it, edit config, build features. Do not edit the kit's shared code per project.

```
kit/
  backend/   Express 5, Mongoose, BullMQ, Redis, signed cookies, Vitest
  frontend/  React 19, Router 7, TanStack Query, Zustand, Tailwind 4, shadcn (Base UI), i18next
```

## 1. Start a new project

1. Clone the kit into a new folder; delete `.git`, run `git init`.
2. Backend: copy `.env.example` to `.env`, fill it (Mongo, Redis, JWT, cookie secret, SMTP, Google, storage).
3. Frontend: copy `.env.example` to `.env` (`VITE_API_BASE_URL`, `VITE_DEFAULT_LANG`).
4. `npm install` in both. Run `npm run check` (frontend) and `npx vitest run` (backend). Both must be green before any change.
5. Edit the config files (section 3), then add features (section 6).

Dev reminders:
- Backend `npm start` runs the **compiled** `dist/`. After code changes run `npm run build`, or use a dev runner. A stale build causes 404s on new routes.
- Vite reads `.env` only at startup. Restart after editing it.

## 2. Frontend structure

```
src/
  config/      paths.ts (every URL), site.ts (brand facts)
  lib/         axios, query client, env, errors, files, format, i18n   (knows no feature)
  store/       layout.ui.store.ts
  components/
    ui/        shadcn + custom Button, Input, FormSelect, FileDropzone
    layout/    AppShell, MarketingLayout, AuthLayout, nav/public config, PageContainer,
               PageHeader, ConfirmDialog, ErrorPage, ErrorPanel, DocumentTitle
  features/    auth, user, settings, notifications, preferences, uploads, marketing, dashboard
  app/         router (Index, PublicPath, PrivatePath), layouts that connect session to shell
  test/        setup.ts
```

## 3. Files you edit per project

| File | Purpose |
|---|---|
| `index.css` | Brand: `--primary`, `--primary-foreground`, `--ring` (+ `--background`). Light and `.dark`. |
| `config/site.ts` | name, supportEmail, legalUpdated, legal links |
| `config/paths.ts` | every URL, once |
| `components/layout/nav.config.ts` | sidebar links, account menu, `layout: 'sidebar' \| 'topnav'` |
| `components/layout/public.config.ts` | marketing nav, CTAs, footer columns |
| `features/settings/settings.config.ts` | settings tabs and groups (role gating) |
| `lib/i18n/locales/en/*.ts` | all wording, one file per namespace |
| `index.html` | `<title>` must match `site.name` (the one place HTML cannot import config) |

## 4. Rules (enforced where noted)

**Ownership**
- Whoever owns the endpoint (`/auth/*`, `/user/*`) owns its api, hooks, query keys, schemas, forms.
- Pages are thin: compose domain components, no `useMutation`, no schemas.
- Config files are data only.

**Imports (enforced by ESLint, `npm run lint`)**
- `components/`, `lib/`, `config/`, `store/` never import `features/` or `app/`.
- `features/` never import `app/`.
- `auth` never imports `user`, `settings`, `notifications`, `preferences`.
- Features reach each other only through `index.ts`. Inside a feature use relative imports.
- The router may deep-import page files (lazy loading).

**Styling (partly enforced by `npm run check:colors`)**
- Semantic tokens only: `bg-card`, `text-foreground`, `border-border`, `bg-primary`. Never raw palette colors or `bg-white`.
- Variants describe intent (`default`, `destructive`), not color names.
- Pages never set min-height, background, max-width or outer padding. Use `PageContainer` (`narrow | standard | wide`).

**State**
- Server data: React Query. UI state shared across components: Zustand. Local UI: `useState`. Forms: react-hook-form + zod.
- Query keys contain everything the data depends on. Key factories per feature, shared prefix for invalidation.
- Mutation hooks do data work (cache); components do screen work (toast, navigate, close).

**i18n**
- Every visible string is a `t()` key, including landing and legal copy. A one-language project still uses keys.
- Namespaces: common, validation, errors, auth, layout, settings, notifications, marketing, legal.
- Zod messages are keys (`'validation:emailRequired'`), translated in forms with `translateMessage`.
- Never build sentences from pieces. Use `{{var}}` and `<Trans>` for links.
- Typed keys: a wrong key fails `tsc`. A new namespace = one file + one line in `locales/en/index.ts`. A new language = a folder with the same shape + one line in `lib/i18n/index.ts`.
- Backend messages and notification text stay English until the backend sends codes.

**Accessibility**
- Skip link and `id="main"` on every layout. Icon-only buttons need `aria-label`. Errors use `aria-describedby`.

## 5. Session model

- Cookies (httpOnly, signed): access 15 min, refresh 7 days (path-scoped). No tokens in JS.
- Session cache key `['session']`: `undefined` = never asked, `null` = nobody, user object.
- `app` loader checks it; auth pages redirect logged-in users away.
- axios: 401 → refresh once → retry once; refresh fails → `onSessionExpired` → clear cache → reload to `/login?redirect=`.
- `SKIP_REFRESH` urls never refresh (a 401 there is a user mistake). Add new auth endpoints to it.
- Production cookies use `SameSite=strict`: frontend and API must share a site (e.g. `app.x.com` + `api.x.com`).
- `clearSession` wipes all other cached queries so the next user never sees old data.

## 6. Add a feature (recipe)

1. `features/<name>/` with `api/`, `hooks/` (key factory), `schemas/`, `components/`, `pages/`, `index.ts`.
2. URL in `config/paths.ts`.
3. Lazy route in `PrivatePath.tsx` with `handle: { titleKey }`.
4. Sidebar item in `nav.config.ts` (key in `layout.ts`).
5. Wording in a new locale namespace.
6. Mutations invalidate the feature's key prefix in the hook.
7. Tests beside the code (`*.test.ts[x]`); `npm run check` green; one commit.

## 7. Remove a feature

- **marketing**: delete the folder, the marketing route group in `Index.tsx`, `public.config.ts`.
- **settings tabs**: delete the config entry, route, page.
- **notifications**: delete the folder, the bell slot in `PrivateLayout`, the settings tab.
- **auth**: last. It also means removing the `app` loader guard, auth routes, session read in `PrivateLayout`, `registerSessionExpiry`/`registerBfcacheGuard` in `main.tsx`, and everything that reads `['session']` (user, settings, notifications).
- Locale namespaces for removed features live in `lib/i18n/locales/en/`; delete them too.

## 8. Backend contract the frontend assumes

- Success: `{ success: true, message, data?, pagination? }`. Errors: `{ success: false, message }`.
- Statuses: validation and wrong-input errors are 400/403, **never 401** (401 triggers refresh).
- Auth: `/auth/{register,login,logout,refresh-token,verify-otp,resend-otp,forgot-password,reset-password,change-password,sessions,google}`.
- User: `/user/{profile,update,change-email,avatar,deactivate,hard-delete}`.
- Notifications: `/notifications`, `/unread-count`, `/read-all`, `/:id/read`, `/:id`.
- Uploads: `POST /uploads/sign`, `POST /uploads/confirm`, `DELETE /uploads?fileKey=`.
- A client's backend will differ. Adapt only: `lib/errors.ts`, `lib/axios.ts`, `features/*/api`, `SessionUser` type.

## 9. Uploads

- Browser asks `/uploads/sign`, uploads directly to storage, then saves `fileKey` (never a URL) via the feature endpoint, which confirms against real storage data.
- Backend drivers: `cloudinary`, `fake` (tests). Add S3/R2 as one driver file + one case in `storage/index.ts`.
- Rules per purpose live in `upload.rules.ts`. Never allow SVG. Production refuses the fake driver.
- Orphaned files (signed but never confirmed) need a periodic cleanup.

## 10. Commands

Frontend: `npm run dev | build | lint | test | test:coverage | check` (`check` = tsc + lint + colors + tests).
Backend: `npm run build | start`, `npx vitest run`.
Always run `check` before committing.

## 11. Known gaps

- Google-only users still see "Current password" (needs a `hasPassword` flag from the backend).
- Notification titles/messages are English from the backend.
- No Lighthouse/a11y CI; `eslint-plugin-jsx-a11y` waits for ESLint 10 support.
- Coverage is thin outside auth core; test what is expensive to break.
- Dev-only audit warnings come from the `shadcn` CLI chain; do not `npm audit fix --force`.
- Unconfirmed in production: cookie flags over HTTPS, real S3/R2 driver.