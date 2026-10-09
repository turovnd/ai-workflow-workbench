# AI Workflow Workbench — Support Desk

Resolve synthetic customer requests with answers grounded in versioned help articles. Prepare a reply, inspect its sources, edit the saved draft, and explicitly approve a response or internal escalation. **No email is sent.**

Implemented: React/Vite with the official shadcn Nova / Neutral / Blue / Inter / Lucide preset, independent email/password and demo sessions, a Fastify API, PostgreSQL retrieval and history, and a separate durable worker. The interface always uses the real API. Deterministic generation is the default; optional OpenRouter generation is explicitly enabled and globally budgeted. Remote deployment and hosted CI results are separate from local verification.

**Deployment status — 2026-10-10:** the API, worker and PostgreSQL are deployed in their isolated Yandex Cloud Docker project using `turovnd-workflow:20261010-support.2`. Migrations passed; [HTTPS readiness](https://workflow-api.b2p.space/health) returned 200 in deterministic mode. PostgreSQL remains private and the API is published only on loopback behind the reverse proxy. Public HTTPS backend smoke testing passed: disjoint numerically ordered cursor pages, cross-workspace cursor/ticket/run rejection, persisted queued-to-ready SSE, worker draft preparation, edited draft versioning, approval with idempotent replay, persisted edited history and resolved ticket status, and revocation of both test sessions. The Vercel UI is still pending because the requested MCP connection is unavailable; there is no public UI URL yet.

## Start the complete local application

Use Docker Compose. Each repository has its own project, network, credentials and database volume. Copy the example only when `.env` does not already exist, then set a unique URL-safe database password.

```sh
cp -n .env.example .env
# Edit POSTGRES_PASSWORD in .env.
docker compose --profile local up --build -d
```

Open `http://127.0.0.1:4173`. The local web container proxies `/api` to Fastify. PostgreSQL stays private; the API is available on loopback `4010`. A one-shot migration service completes before API/worker startup. `docker compose --profile local down` stops only this project; do not add `-v` unless deliberately deleting its data.

1. Choose **Try the demo**, or create an independent account.
2. The first ticket asks about an expired sign-in link. Choose **Prepare reply**.
3. Open a citation and check its exact quote and article revision.
4. Edit the response, save the draft, then **Review & approve** the exact saved version.
5. Try **Reply + escalation**, or the unsupported retention-policy question, which requests clarification instead of promising a policy.
6. Scroll the inbox to load all 36 synthetic tickets. Filter resolved tickets, reload a saved reply, or sign out and sign in again.

Demo work and sessions expire after 24 hours. Registered workspaces survive demo cleanup; account sessions still expire after 24 hours. Only one session per account is active. Account email identities are unverified: this portfolio demo does not provide email delivery, password recovery, organizations or roles. Passwords use salted scrypt and hashing concurrency is bounded. Bearer tokens are held in session storage, cleared on logout, and sent only to the configured API.

## Develop locally

Use Node 24.21.0 and npm 11.19.0.

```sh
npm ci
npm run dev
```

Vite at `http://127.0.0.1:5173` proxies `/api` to the local Docker API. For native backend development, set `DATABASE_URL` to an isolated PostgreSQL database and run `npm run db:migrate`, `npm run dev:api` and `npm run dev:worker` in separate terminals. Native commands read process environment variables; they do not implicitly load `.env`.

## Contracts and bounds

- **Retrieval and provenance:** PostgreSQL lexical full-text retrieval includes only current synthetic document revisions. Citations preserve revision IDs, exact quotes and source text. Archived policy text cannot become current evidence. Ticket/article text is untrusted data, never an instruction to execute a tool.
- **Draft review:** model output and every citation must validate before the draft becomes approvable. An edited draft is clearly marked **Edited by you**, without claiming its edits were model-validated. Version conflicts require reloading the saved draft. One transaction records the exact approved version, history, optional escalation and idempotency receipt. A matching retry replays its receipt; conflicting intent fails.
- **Durable jobs:** run and job creation commit together. Workers use 90-second leases, increasing fences and three maximum deliveries. Cancellation invalidates a claimed worker. Crash recovery may repeat external work; fenced completion and idempotent stored effects do not imply exactly-once model billing.
- **Progress and recovery:** persisted SSE events have contiguous per-run cursors. The client deduplicates events, can resume, and fetches a final snapshot. The OpenRouter adapter requests strict JSON, so the UI shows honest preparation progress and then the fully validated reply. It does not simulate token streaming by delaying chunks of a completed response.
- **Pagination:** ticket and history endpoints use `cursor` and `limit` (1–50), stable descending sequence keysets and a first-page insertion ceiling. HMAC-authenticated opaque cursors are tied to workspace and filter/ticket; malformed, tampered or mismatched cursors return 400. New inserts require refresh. Status membership is live: after status changes refresh the filtered view; this is not a frozen snapshot. The UI deduplicates IDs, resets on filter changes, and provides scroll loading plus a **Load more** button.
- **Capacity:** 32 KiB request bodies, 6,000-character drafts, 36 seeded tickets, 20 runs per workspace, 1,000 total workspaces, bounded session/anonymous retention cleanup, exact CORS origins and route rate limits. Offline mutations are disabled; there is no offline approval queue or service worker cache.

## Optional OpenRouter mode

The server-side adapter uses `openai/gpt-4.1-mini` by default, strict JSON Schema with required parameters, a 45-second timeout, 1,200 output tokens, a 32 KiB response limit and exact citation checks. Provider failures are visible and terminal; there is no silent deterministic fallback or automatic network retry. Missing evidence requests clarification without a model call.

Live mode requires all of `GENERATION_MODE=openrouter`, `ALLOW_LIVE_PROVIDER=true`, and `OPENROUTER_API_KEY`. `OPENROUTER_MODEL` configures the model. `LIVE_CALL_BUDGET` defaults to 2 and is bounded to 0–10. Every attempted network call reserves one unit in PostgreSQL before the network request, including lease redelivery. The global used count persists through new sessions, expiry cleanup and container restarts; raising the budget raises the lifetime admission ceiling, not a daily quota. Reservations are not refunded after errors. Each workspace also allows at most three live runs. No secret belongs in `VITE_*`.

Tests use deterministic generation or injected HTTP fakes. A separately authorized live adapter smoke was executed by the deployment coordinator; routine test commands do not spend provider credits.

## Verification

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/disposable_test_db npm run test:db
npx playwright install chromium
# Keep the local Compose stack running for browser tests.
npm run test:e2e
npm run build
npm run build:server
```

**The database test command truncates its target database. Use a disposable test database only.** PostgreSQL tests exercise concurrent effects, rollback, competing leases, recovery, cancellation lock ordering, a one-connection pool, account/session isolation, cursor scope and insertion ceilings, edited approval versions, UTF-8 limits and a persistent global provider budget. Unit tests cover provider validation, source safety, SSE parsing and delayed session responses. Browser tests exercise real account/demo APIs, pagination, source keyboard focus, edit/approval/reload, missing evidence, mobile/offline controls and automated accessibility checks.

CI provisions PostgreSQL, checks code and builds/starts the isolated local Compose stack for browser journeys. The separate manually dispatched release workflow packages a backend image; it does not deploy this server automatically.

## Deployment boundary

Vercel serves `dist/`; set `VITE_API_URL=https://workflow-api.b2p.space` for the configured deployment. The API, worker and PostgreSQL remain in this project's Docker stack. Vercel Services/Queues, Redis and Kafka are not required. Exact frontend origins belong in `CORS_ORIGINS`; do not allow every `vercel.app` host. `TRUST_PROXY` defaults to none and must list only verified reverse-proxy peers. The reverse proxy needs a 32 KiB request limit, disabled SSE buffering and a timeout longer than 90 seconds.

Build the `runtime` Docker target for the server's architecture and use a versioned `APP_IMAGE`. The optional `local` web profile is for local review, while production UI remains on Vercel. Update only this Compose project, smoke-test readiness and a complete approval, and retain the preceding compatible image. Database backups and restore verification are separate operational requirements. One server is a shared failure domain; high availability is not claimed.

## Provenance

Built independently with synthetic tickets, people and help articles, with AI assistance. No private client implementation, dataset or production metrics are included. Generated UI primitives and utilities retain their upstream license attribution in `THIRD_PARTY_NOTICES.md`. Historical implementation plans remain in `docs/`; this README describes the approved Support Desk implementation.
