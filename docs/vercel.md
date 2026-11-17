# Vercel deployment

The project deploys three services from one repository: `frontend` (Vite), `backend` (Fastify) and `worker` (queue consumers). Only the frontend and API have public rewrites. Requests use `/api` on the frontend origin; Swagger is at `/docs/` and the schema at `/openapi.json`.

The worker uses the [Build Output API](https://vercel.com/docs/build-output-api/primitives) to package two private functions, with their subscriptions and limits read from `vercel.json`. Its Docker entrypoint is a polling loop and must never be deployed as a static build. CI loads both function bundles outside the repository to catch missing runtime dependencies.

## Database and configuration

Create a separate Neon PostgreSQL project for Support Desk. Use its pooled connection URL for the API and worker and its direct connection URL for migrations. Preview deployments must use an isolated database branch; do not connect an unreviewed branch to production data.

Runtime settings:

| Setting                      | Consumer        | Purpose                      |
| ---------------------------- | --------------- | ---------------------------- |
| `DATABASE_URL`               | backend, worker | Pooled database connection   |
| `GENERATION_MODE=openrouter` | backend, worker | Live AI mode                 |
| `ALLOW_LIVE_PROVIDER=true`   | backend, worker | Explicit provider enablement |
| `OPENROUTER_API_KEY`         | worker only     | Model credential             |
| `OPENROUTER_MODEL`           | worker          | Model identifier             |
| `LIVE_CALL_BUDGET=-1`        | worker          | No lifetime application cap  |
| `TRUST_PROXY=127.0.0.1,::1`  | backend         | Trust the local Vercel proxy |

Vercel overwrites `X-Forwarded-For` at ingress. Trust only its local runtime proxy so the API's per-IP rate limiter distinguishes visitors. Keep this empty when running the API directly; do not trust arbitrary proxies.

Secrets belong in Vercel project environment settings, scoped to Production or Preview. Services share the project environment; this is not a per-service secret boundary. Only the worker code consumes the model key, and Vite never exposes it because it has no public prefix. Local Docker injects the key only into the worker. The frontend needs no API credential or absolute API URL.

## Release order

1. Run the [checks](testing.md).
2. Apply reviewed migrations through the direct Neon connection: `DATABASE_URL=... npm run db:migrate`. Supply the URL privately through the environment, never Git.
3. Deploy a preview with its own database branch and test the complete user flow.
4. Merge the reviewed change to `main`; the Git integration deploys the project.
5. Verify demo login, a real AI draft, citation review, approval and reload at the public URL.

The `support-replies` queue wakes the private worker. The `support-maintenance` schedule runs every 30 minutes to recover committed jobs that lost their notification and expired leases. This recovery interval allows an idle database to suspend; normal notifications start work immediately. These platform features are in beta; job state and fencing live in PostgreSQL so the same processor can run in Docker if delivery needs to move.

A deployment rollback changes code, not database schema or approved responses. Use additive migrations, take a backup before a destructive change, and restore into a separate database first.

The `content-disposition` override keeps Swagger static assets compatible with the Vercel Node loader. The upstream ESM-only version fails when loaded by CommonJS in this runtime ([upstream issue](https://github.com/fastify/fastify-static/issues/612)). CI checks the Swagger dependency chain with `require(ESM)` disabled.
