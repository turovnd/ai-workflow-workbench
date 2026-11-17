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
COPY frontend ./frontend
COPY backend/common/contracts ./backend/common/contracts
RUN npm run build:web

FROM nginx:1.30.5-alpine AS runtime
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 8080
