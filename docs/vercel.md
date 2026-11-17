# Vercel deployment

The project deploys three services from one repository: `frontend` (Vite), `backend` (Fastify) and `worker` (queue consumers). Only the frontend and API have public rewrites. Requests use `/api` on the frontend origin; Swagger is at `/docs/` and the schema at `/openapi.json`.

## Database and configuration

Create a separate Neon PostgreSQL project for Support Desk. Use its pooled connection URL for the API and worker and its direct connection URL for migrations. Preview deployments must use an isolated database branch; do not connect an unreviewed branch to production data.

Runtime settings:

| Setting                      | Service         | Purpose                      |
| ---------------------------- | --------------- | ---------------------------- |
| `DATABASE_URL`               | backend, worker | Pooled database connection   |
| `GENERATION_MODE=openrouter` | backend, worker | Live AI mode                 |
| `ALLOW_LIVE_PROVIDER=true`   | backend, worker | Explicit provider enablement |
| `OPENROUTER_API_KEY`         | worker only     | Model credential             |
| `OPENROUTER_MODEL`           | worker          | Model identifier             |
| `LIVE_CALL_BUDGET=-1`        | worker          | No lifetime application cap  |

Secrets belong in Vercel environment settings, scoped to the relevant services and deployment environment. The frontend needs no API credential or absolute API URL.

## Release order

1. Run the [checks](testing.md).
2. Apply reviewed migrations through the direct Neon connection: `DATABASE_URL=... npm run db:migrate`. Supply the URL privately through the environment, never Git.
3. Deploy a preview with its own database branch and test the complete user flow.
4. Merge the reviewed change to `main`; the Git integration deploys the project.
5. Verify demo login, a real AI draft, citation review, approval and reload at the public URL.

The `support-replies` queue wakes the private worker. The `support-maintenance` schedule runs every 30 minutes to recover committed jobs that lost their notification and expired leases. This recovery interval allows an idle database to suspend; normal notifications start work immediately. These platform features are in beta; job state and fencing live in PostgreSQL so the same processor can run in Docker if delivery needs to move.

A deployment rollback changes code, not database schema or approved responses. Use additive migrations, take a backup before a destructive change, and restore into a separate database first.
