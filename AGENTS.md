# Support Desk repository rules

## Authority and provenance

The owner authorized implementation, Vercel deployment of this independent app with a separate Neon database and a local Docker stack. The owner also explicitly authorized creation and pushes to the **public** GitHub repository `turovnd/ai-workflow-workbench` and Git-connected automatic deployment. Older no-push statements are historical and superseded. Verify the actual account, repository and project before mutation; do not repurpose another app's project. Preserve unrelated repositories, services, volumes and proxy configuration.

Build independently with synthetic data and state AI assistance accurately. Do not copy private client code, datasets, comments, screenshots, logs or Git history. Do not invent authorship, dates, commits, reviews, credentials, production metrics or test results. Never commit secrets, private local paths or career documents. Inspect status before edits; do not discard unrelated work.

Code, comments, UI and project documentation are English.

## Architecture and style

Use npm workspaces: frontend, backend/modules/api and backend/modules/worker; shared code lives in backend/common. Backend modules have no src wrapper. Web imports transport contracts only. API and worker may share packages, never import each other. Frontend source separates pages, components, hooks and lib; the Fastify app factory composes routes/plugins/schemas separately from listening. Use explicit package exports.

Hand-written TypeScript uses named arrow exports (`export const name = (...) => {}`), explicit types, `import type`, early returns and small injected modules. Preserve supported conventions in upstream generated UI code. Validate external data at runtime; avoid unchecked casts and `any`. Python uses typed snake_case functions, async I/O, strict Pydantic boundary schemas and a session per concurrent unit of work.

Use official shadcn CLI components and the accepted Nova / Neutral / Blue / chartBlue / Inter / Lucide preset. Keep semantic tokens and accessible composition. Server state belongs in TanStack Query; shareable filters belong in the URL; keep derived state derived. Add stores, brokers or infrastructure only for a demonstrated need.

## Tests and delivery

Automated tests live under frontend/tests and backend/tests, mirroring their owning production paths. Distinguish unit, API, real PostgreSQL, worker and browser tests. Test task-specific behavior rather than mirroring implementation. Use deterministic providers and inputs; paid provider calls require explicit authorization and enforced budgets.

Run formatting, lint, types, unit tests and builds relevant to the change. Database guarantees require real PostgreSQL tests with concurrency/recovery; use disposable test databases only. Browser work needs keyboard/focus, loading/empty/error, stale-session, paging and offline behavior checks as applicable. A screenshot or mocked database is not complete flow evidence.

Keep request sizes, sessions, jobs, retries, provider output and spending bounded. Persist job admission, fences and idempotent effects. Do not claim exactly-once external calls/billing. Credentials stay server-side; `VITE_*` values are public.

## Documentation and planning

`README.md` is the short entry point. `docs/` describes the current product, contracts, setup and operations. Do not create archives or versioned product plans. `docs/planning/README.md` is the MVP epic/story index. Every task has its own file, stable ID, `is_task_of` story, dependencies, scope, acceptance criteria, tests, status and implementation evidence.

Distinguish source present, verified locally, deployed and externally integrated. Record actual commands and scope; do not turn prior-layout test counts into proof that a structural refactor passed. Record verification evidence in task files. Epics and stories describe intended outcomes, not retrospective implementation reports.
