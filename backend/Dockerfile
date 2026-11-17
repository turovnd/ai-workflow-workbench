FROM node:24.21.0-alpine3.24 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/common/config/package.json ./backend/common/config/package.json
COPY backend/common/contracts/package.json ./backend/common/contracts/package.json
COPY backend/common/data/package.json ./backend/common/data/package.json
COPY backend/common/knowledge/package.json ./backend/common/knowledge/package.json
COPY backend/common/queue/package.json ./backend/common/queue/package.json
COPY backend/modules/api/package.json ./backend/modules/api/package.json
COPY backend/modules/worker/package.json ./backend/modules/worker/package.json
RUN npm ci

FROM dependencies AS build
COPY tsconfig.base.json ./
COPY backend ./backend
RUN npm run build:server && npm prune --omit=dev

FROM node:24.21.0-alpine3.24 AS runtime
ENV NODE_ENV=production MIGRATIONS_DIR=/app/backend/migrations
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/backend/modules/api/dist ./backend/modules/api/dist
COPY --from=build --chown=node:node /app/backend/modules/worker/dist ./backend/modules/worker/dist
COPY --from=build --chown=node:node /app/backend/migrations ./backend/migrations
USER node
EXPOSE 4010
CMD ["node", "backend/modules/api/dist/main.mjs"]
