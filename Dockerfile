FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/contracts/package.json ./packages/contracts/package.json
COPY packages/data/package.json ./packages/data/package.json
COPY packages/knowledge/package.json ./packages/knowledge/package.json
COPY packages/config/package.json ./packages/config/package.json
RUN npm ci

FROM dependencies AS build
COPY tools ./tools
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY apps/worker ./apps/worker
COPY packages ./packages
RUN npm run build:server && npm prune --omit=dev && npm cache clean --force

FROM dependencies AS web-build
COPY tsconfig.base.json ./
COPY apps/web ./apps/web
COPY packages/contracts ./packages/contracts
RUN npm run build:web

FROM nginx:1.30.5-alpine@sha256:0985e772fb9f729e6fa0980da05fca5d9c468e870eed43071545afa9d2e27d94 AS web
COPY deploy/web.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080

FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS runtime
ENV NODE_ENV=production MIGRATIONS_DIR=/app/db
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/apps/api/dist/main.mjs ./dist-server/index.mjs
COPY --from=build --chown=node:node /app/apps/api/dist/migrate.mjs ./dist-server/migrate.mjs
COPY --from=build --chown=node:node /app/apps/worker/dist/main.mjs ./dist-server/worker.mjs
COPY --from=build --chown=node:node /app/packages/data/migrations ./db
USER node
EXPOSE 4010
CMD ["node", "dist-server/index.mjs"]
