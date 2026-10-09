> Approved scope update (2026-10-10): Support Desk replaces the operational case scenario. The real account/demo API, support inbox, versioned help articles, editable reply approval, persisted history and cursor pagination are implemented. Live generation uses OpenRouter with lexical retrieval and strict exact-source validation; semantic embeddings, pgvector and true token streaming are not implemented. See README.md for current behavior and executed verification; the original plan below is historical.

# Implementation plan: evidence to approved action

Updated 2026-10-09. **Hosting, scenario and style checkpoint accepted; implementation authorized.** This supersedes the earlier feedback-chat plan. Full RAG is in scope; arbitrary document uploads are not required for the first slice.

## Product and first vertical slice

The user is a reviewer handling a fictional service-change case. The screen combines a case list, evidence-backed briefing, source viewer and approval panel. A bundled, independently authored Markdown corpus contains runbooks and policies with deliberately conflicting revisions and missing information. Start with one task type: create a remediation task in the demo database.

Seed documents -> deterministic parsing/chunking -> versioned searchable chunks -> bounded retrieval -> streamed draft -> validated citations and proposal -> approval -> one task and audit record. No general workflow canvas or external write integration.

Keyless mode performs actual PostgreSQL full-text retrieval; generation is deterministic and visibly labelled. The result is a working retrieval workflow, not a semantic-quality benchmark. Optional live mode uses OpenRouter generation and a separately configured embedding adapter with pgvector. Record embedding provider/model/dimensions and corpus revision; reindex on incompatible changes. Lexical and semantic modes remain visibly distinct. Do not silently fall back to fixture vectors while claiming semantic retrieval.

## Proposed contracts

- Runs capture corpus revision, retrieval strategy, prompt/schema versions, provider mode and bounded input. Retrieved evidence belongs to that run and workspace.
- Citations reference document revision, chunk ID and quote/offset. Validate membership and quote provenance server-side; a real ID alone does not establish support for a claim. Include a small synthetic eval set with expected evidence and abstention cases, not invented quality scores.
- Draft stream events cannot authorize an action. Only a completed, schema-valid and semantically checked result can produce a proposal. Source text is untrusted data, never tool instructions.
- Run states: queued -> retrieving -> generating -> ready, with failed/cancelled terminals. Proposal states: pending -> approved/rejected/expired. Approval does not hold an LLM run or request open.
- Approve with expected proposal version and a workspace-scoped idempotency key. Hash canonical validated intent. Same key/same payload returns the prior result; same key/different payload or stale version conflicts. Replay lookup must precede stale-state rejection for completed identical requests.
- The transaction checks workspace authorization/version, creates the task, records approval, stores idempotency outcome and appends its event. Unique constraints and conditional updates enforce the contract. Demo tasks are internal DB effects; any later external effect needs a separate outbox and reconciliation contract.
- Event cursor order is a server-assigned sequence per run/workspace, never a timestamp. Persist stream events before exposing them. Replay duplicates safely; an expired cursor requires a snapshot with a new watermark.
- Cancellation stops new work and marks the boundary; completed tasks are not undone. Provider cancellation/cost cessation cannot be guaranteed across every provider.

## Execution and boundaries

Use one modular Fastify backend, an app factory separate from listen, explicit route schemas, application services and repositories. Proposed folders: `apps/web/src/{features,api,components}`, `apps/api/src/{app,modules,jobs}`, `packages/contracts`, `db/migrations`, `tests`. Keep abstractions proportional; a shared package is only for genuinely shared contracts within this repo.

Store jobs and retry state in PostgreSQL, committed together with the relevant business state. Both local and hosted environments run the same separate Node worker process in Docker. The worker polls eligible jobs, claims with a lease/fencing version, calls providers outside the transaction and conditionally persists the result. A stale worker cannot overwrite a newer completion. No external broker publish is needed. The UI is deployed separately on Vercel and connects directly to the HTTPS API. See [the selected hybrid deployment](hybrid-deployment.md).

Proposed initial safety budgets, to be measured: 24 synthetic documents; 8 retrieved chunks; 32 KB context; 64 KB generated output; 60s provider timeout; at most 3 attempts across separate deliveries; 120s job slice; 90s SSE connections with replay; at most 2 admitted provider attempts per demo workspace. These are design limits, not measured throughput. Persist workspace budget reservations so scale-out cannot bypass limits. Live mode is disabled on anonymous public demos unless server-enforced quotas are configured.

### Worker deadlines, recovery and cursors

Each claimed item receives one bounded provider attempt; retries persist a next-attempt time and return to the eligible queue. Claim only immediately serviceable items, up to 2 at once; a batch of 10 is a fetch ceiling, not permission to lease 10 idle jobs. Keep the 120s application slice and a 15s commit/cleanup margin as design budgets; they are no longer Vercel Function limits. Cap provider time by the remaining slice budget, persist continuation and renew leases safely with fencing. On shutdown, stop claiming new work, allow a bounded drain and let unfinished claims expire. Admission limits do not guarantee remote provider cancellation after a worker crash.

Commit a job row with business state; worker polling removes the database-to-external-broker publish gap. A worker crash after commit is recovered by another poll; expired leases are retried according to persisted attempt limits. Optional notifications can reduce latency but never replace polling. Show queued, leased/running, retryable and terminal states explicitly. Test crash after job creation, after provider response and before result commit, plus expired leases and stale completion. No Vercel Queue visibility, TTL or cron dependency remains.

Event sequence is a commit-consistent cursor, not a plain PostgreSQL sequence or timestamp. Serialize each workspace's event append with a locked counter row in the same mutation transaction; read snapshot data and watermark from one consistent DB snapshot. Test reversed transaction completion and concurrent snapshot/append so a higher cursor cannot hide a lower unseen event. This deliberately trades per-workspace write parallelism for a simple, testable demo contract.

## UI and service worker

Use official shadcn Button, Card, Table, Sheet, Alert, Empty, Skeleton and Dialog composition as appropriate. Keep filters in the URL and remote state in TanStack Query. Provide keyboard source navigation, visible focus, dialog titles/focus return, reduced-motion support and readable contrast. Announce streaming status sparingly; do not announce every token.

Show initial/loading/empty/no-evidence/provider-error/partial-draft/stale-proposal states distinctly. On conflict, show the current proposal and require a new review. On reconnect, retain visible evidence until the consistent replacement is available.

Service-worker support follows the online slice: cache the versioned app shell and explicitly selected synthetic evidence for read-only offline review. Display snapshot age and an offline banner. Approval, live API responses and streams bypass caches; no queued offline approvals. Update caches by version and test upgrade/logout/reset cleanup. HTTPS or localhost is required.

## Verification and delivery

| Layer | Required evidence before release |
| --- | --- |
| Static | ESLint, Prettier check, strict TypeScript typecheck and production builds. |
| Unit/contract | Chunk boundaries, stable provenance, empty retrieval/abstention, model schema/evidence rejection, SSE frame parsing including split UTF-8 and errors inside HTTP 200. |
| Real PostgreSQL | Migrations on an empty DB, concurrent approvals, idempotency conflicts/replay, transaction rollback, two claimers, lease expiry, stale completion, crash after durable job commit before worker claim and retry exhaustion. |
| Integration | Fastify injection for routes and authz; real HTTP server for stream flush, disconnect and cancellation. Workspace identity is server-established, not accepted from request bodies. |
| E2E | Playwright keyless journey through evidence and one approval, keyboard and automated accessibility checks, reconnect, stale conflict and offline read-only recovery. |
| CI/CD | GitHub Actions with real PostgreSQL/pgvector service, locked installs, checks and artifacts. Vercel UI previews, versioned backend container images, isolated staging data, controlled migrations, release smoke tests and rollback procedure. Deployment destinations are selected; application readiness and access details remain required. |

Fixtures use fixed seeds; no live LLM key is required in CI. A separate opt-in provider smoke test checks the configured model and budget after credentials are authorized. Only then document semantic retrieval/live output as verified. Do not present mocked DB tests as transaction evidence.

## Sequence and acceptance

1. Completed: the owner accepted the style samples and scenario.
2. Pin versions; build a local keyless vertical slice with a real DB and executable setup.
3. Prove concurrency/recovery contracts; polish accessibility and offline read-only behavior.
4. Verify optional live providers, Docker API/worker/DB deployment and the Vercel UI connection when destination/access details exist.
5. Publish accurate case study, failure walkthrough and observed limitations; obtain publication instruction.

Start the second demo after this core is reviewable. No Kafka, Kubernetes, AWS service, model training or production SSO is needed for v1.

## Library evidence

- [Fastify validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/): application-owned schemas; configure and test coercion explicitly.
- [Fastify testing](https://fastify.dev/docs/latest/Guides/Testing/): app injection is useful but does not replace socket-level streaming tests.
- [OpenRouter structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs): verify the provider endpoint and required parameters; still validate locally.
- [OpenRouter streaming](https://openrouter.ai/docs/api_reference/streaming): handle stream-level errors and usage frames.
- [OpenRouter embeddings](https://openrouter.ai/docs/api_reference/embeddings): separate model catalogue and embeddings endpoint; verify dimensions.

- [TanStack Query cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation): pass the signal to the actual transport and still guard stale selections.
- [Vite static deployment](https://vite.dev/guide/static-deploy.html): production build assets are the frontend deployable; the preview server is not a production server.
- [pgvector](https://github.com/pgvector/pgvector): verify the chosen storage/index type supports the configured embedding dimensions; start with correctness before approximate indexing.
