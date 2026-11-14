# Taskwork

![CI](https://github.com/kiyayu/Taskwork/actions/workflows/ci.yml/badge.svg)

A project board for small teams. You make lists, drag tasks between them, add checklists, comment, and attach files. Changes from other people show up without refreshing the page.

**Live demo:** https://YOUR-APP.vercel.app

Click "Try the demo" to look around without signing up. The backend is on free hosting, so the first load after a break can take up to a minute.

## What you can do

- Create projects and lists, drag tasks around, archive and restore them
- Give a task an assignee, due date and priority
- Add a checklist to a task, with sub-items and a progress bar
- Comment on tasks and @mention teammates (they get a notification)
- Attach images and PDFs and view them inside the app
- Invite people with a link. They join as editor or viewer
- See what happened in a project in the activity feed
- Dashboard with your own tasks, due soon and overdue
- Admin page with numbers for the whole system (no project contents)
- Sign up with an email code or Google, reset your password, see and end your logged-in devices
- Dark mode

## Built with

- **Frontend:** React, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind, dnd-kit, i18next
- **Backend:** Node.js, Express, MongoDB, Redis, BullMQ, Zod
- **Other:** Cloudinary for files, Docker, GitHub Actions, Vercel, Render

## How it is organised

**Backend:** each feature is a module with routes, controller, service and model. Everything inside a project lives under `/api/projects/:projectId`, so the project id is always in the URL.

**Frontend:** each feature is a folder with api, hooks, components and pages. Data comes from the server through TanStack Query. Shared things (layout, buttons, axios, translations) are kept apart from the features.

## Decisions I made

- **Permissions in one place.** A single permission matrix says what each role (owner, editor, viewer) can do, and every service method checks it first.
- **404 instead of 403.** If you are not a member of a project, you get a 404. That way nobody can guess which projects exist.
- **Scoped queries.** Every database query uses the project id as well as the item id, so an id from another project is rejected.
- **Cheap drag and drop.** Dragging saves one number for one task instead of rewriting the whole list. The card moves right away and snaps back if the server says no.
- **Small task documents.** Comments, checklist items, files and activity are in their own collections, so a task document stays small.
- **Safe invite links.** Invite tokens are stored hashed and used with one atomic update, so the max uses limit holds even when two people click at once.
- **Live updates send ids only.** The browser then loads the data through the normal endpoints, so permissions still apply.
- **Text in translation files.** A lint rule also stops shared code from importing feature code.

## Run it on your computer

You need Node.js, MongoDB and Redis, or you can use Docker (see below).

**Backend**

Copy `.env.example` to `.env` and fill it in, then:

```bash
cd backend
npm install
npm run build
npm run seed
npm start
```

**Frontend**

Copy `.env.example` to `.env`, then:

```bash
cd frontend
npm install
npm run dev
```

The seed creates a demo user: `ann@demo.test`.

**With Docker**

This starts the backend together with MongoDB and Redis:

```bash
docker compose up --build
```

## Tests

```bash
cd backend && npx vitest run
cd frontend && npm run check
```

GitHub Actions runs both on every push.

## Deployment

The frontend is on Vercel. It forwards `/api` requests to the backend, so the browser only talks to one address.

The backend runs from `backend/Dockerfile` on Render, with MongoDB Atlas and Upstash Redis.

## Known limitations

- Live updates only work with one server instance. Running more than one would need Redis pub/sub.
- Uploaded files have long random links, but anyone with the link can open them. Signed URLs would fix this.
- Free hosting sleeps, so the first request after a break is slow.
- Ideas for later: task dependencies, email invites, custom fields.