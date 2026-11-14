# Taskwork

A project board for small teams. You make lists, drag tasks between them, add checklists, comment, attach files,
and other people see your changes without refreshing the page.

Live demo: ----
There is a "Try the demo" button, so you don't need to sign up.

![Demo](docs/demo.gif)

I first built a version of this for my final-year group project. This one is the rebuilt version, with tests,
a cleaner structure and real permission checks.

## What you can do

- Create projects and lists, drag tasks around, archive and restore them
- Give a task an assignee, due date and priority
- Add a checklist to a task, with sub-items and a progress bar
- Comment on tasks and @mention teammates (they get a notification)
- Attach images and PDFs and view them inside the app
- Invite people with a link. They can join as editor or viewer
- See what happened in a project in the activity feed
- Dashboard with your own tasks, due soon and overdue
- Admin page with numbers about the whole system (no project contents)
- Sign up with email code or Google, reset password, see and end your logged-in devices
- Dark mode

## Built with

- Frontend: React, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind, dnd-kit, i18next
- Backend: Node.js, Express, MongoDB, Redis, BullMQ, Zod
- Other: Cloudinary for files, Docker, GitHub Actions, Vercel, Render

## How it is organised

Backend: each feature is a module with routes, controller, service and model.
Everything inside a project lives under /api/projects/:projectId, so the project id is always in the URL.

Frontend: each feature is a folder with api, hooks, components and pages. Data comes from the server through
TanStack Query. Shared things (layout, buttons, axios, translations) are kept apart from features.

## Some decisions

- One table says what each role can do (owner, editor, viewer), and every service method checks it first.
- If you are not a member of a project you get a 404, not a 403, so nobody can guess which projects exist.
- Every database query uses the project id as well as the item id, so an id from another project is rejected.
- Dragging saves one number for one task instead of rewriting the whole list. The card moves right away and
  goes back if the server says no.
- Comments, checklist items, files and activity are in their own collections so a task document stays small.
- Invite tokens are stored hashed and used with one atomic update, so the max uses limit holds.
- Live updates only send ids. The browser then loads the data through the normal endpoints, so permissions still apply.
- Text is in translation files, and a lint rule stops shared code from importing feature code.

## Run it on your computer

Backend: copy .env.example to .env and fill it in, then:

    cd backend
    npm install
    npm run build
    npm run seed
    npm start

Frontend: copy .env.example to .env, then:

    cd frontend
    npm install
    npm run dev

The seed makes a demo user, ann@demo.test.
You can also start the backend with MongoDB and Redis using: docker compose up --build

## Tests

    cd backend && npx vitest run
    cd frontend && npm run check

GitHub Actions runs them on every push.

## Deployment

Frontend is on Vercel. It forwards /api requests to the backend, so the browser only talks to one address.
Backend runs from backend/Dockerfile on Render, with MongoDB Atlas and Upstash Redis.

## Not done yet

- Live updates only work with one server instance. More than one would need Redis pub/sub.
- Files have long random links but they are not private.
- Free hosting sleeps, so the first load after a break can be slow.
- Ideas for later: task dependencies, email invites, custom fields.