# Dockerfile
# ---------- 1. build the frontend ----------
FROM node:24-bookworm-slim AS web
WORKDIR /web
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Same origin in production: the API lives under /api on the same host.
ARG VITE_API_BASE_URL=/api/
ARG VITE_DEFAULT_LANG=en
# Public demo account from the seed script. Set both to empty to hide the "Try the demo" button.
ARG VITE_DEMO_EMAIL=ann@demo.test
ARG VITE_DEMO_PASSWORD=DemoPass123
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL VITE_DEFAULT_LANG=$VITE_DEFAULT_LANG \
    VITE_DEMO_EMAIL=$VITE_DEMO_EMAIL VITE_DEMO_PASSWORD=$VITE_DEMO_PASSWORD
RUN npm run build

# ---------- 2. build the backend ----------
FROM node:24-bookworm-slim AS api
WORKDIR /api
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

# ---------- 3. runtime ----------
FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=api /api/package*.json ./
COPY --from=api /api/node_modules ./node_modules
COPY --from=api /api/dist ./dist
COPY --from=web /web/dist ./public
USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]