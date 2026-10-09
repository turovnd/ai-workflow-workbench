# Local setup

## Complete Docker stack

Use Docker Compose v2. Keep an existing `.env`; otherwise copy `.env.example` and replace `POSTGRES_PASSWORD` with a unique URL-safe value.

```sh
cp -n .env.example .env
docker compose --profile local up --build -d --wait
```

The local UI is `http://127.0.0.1:4173`; its nginx proxy sends `/api` requests to this stack's API. Fastify binds host loopback `4010`. PostgreSQL has no public host port. The one-shot migration service must succeed before API/worker startup. Stop this project with `docker compose --profile local down`; omit `-v` to retain data.

## Workspace development

Use the pinned Node 24/npm toolchain in `.nvmrc` and `package.json`; install from the repository root.

```sh
npm ci
npm run dev
```

The web dev server is on `http://127.0.0.1:5173` and proxies `/api` to loopback `4010`. For native backend development, export `DATABASE_URL` for an isolated PostgreSQL database, run `npm run db:migrate`, then start `npm run dev:api` and `npm run dev:worker` in separate terminals. Native Node commands consume process environment; they do not implicitly load `.env`.

`npm run build:web` produces `apps/web/dist`; API/worker builds produce their own `dist` directories. `npm run build` is the aggregate build. Final refactor command verification is recorded in [testing](testing.md).

## Environment

| Setting               | Meaning                                                                       |
| --------------------- | ----------------------------------------------------------------------------- |
| `POSTGRES_PASSWORD`   | Compose-only private database credential; replace the example.                |
| `DATABASE_URL`        | Native API/worker/migrator PostgreSQL connection.                             |
| `APP_IMAGE`           | Versioned backend image used by the deployment.                               |
| `CORS_ORIGINS`        | Exact allowed browser origins, comma separated.                               |
| `TRUST_PROXY`         | Verified proxy peers only; default trusts none.                               |
| `VITE_API_URL`        | Public frontend API origin; production uses `https://workflow-api.b2p.space`. |
| `GENERATION_MODE`     | `deterministic` by default; `openrouter` is explicit opt-in.                  |
| `ALLOW_LIVE_PROVIDER` | Must also be true before live generation.                                     |
| `OPENROUTER_API_KEY`  | Server-only secret, never a `VITE_*` value.                                   |
| `OPENROUTER_MODEL`    | Configured model; baseline defaults to `openai/gpt-4.1-mini`.                 |
| `LIVE_CALL_BUDGET`    | Durable lifetime admission ceiling; default 2, permitted 0–10.                |

A live call needs mode, enablement, key and available durable budget. Failed/abandoned attempts consume budget. Increasing the setting raises the lifetime ceiling; restarting containers does not reset usage. Routine tests remain deterministic.

See [operations](operations.md) for remote deployment and [limits](limits.md) for provider bounds.
