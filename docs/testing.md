# Testing

Run from the repository root after `npm ci`:

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run api:check
npm run build
node --test backend/tests/tools/build-vercel-worker.test.mjs
```

For database guarantees, point `TEST_DATABASE_URL` at a **disposable** PostgreSQL database and run `npm run test:db`. The test helper resets its schema. It must never receive a production connection.

Start the local Docker stack, then run `npm run test:e2e`. Set `E2E_BASE_URL` and `E2E_API_URL` when using different local ports. Browser tests use the sample provider and synthetic data; they do not call OpenRouter.

## What the tests establish

- Backend unit tests: provider response bounds, exact citations, missing-evidence behavior and retrieval.
- PostgreSQL integration tests: tenant isolation, cursor scope/order, concurrent claims, expired leases, stale fences, cancellation, version conflicts and idempotent approvals.
- API integration tests: validation, session guards, Swagger assets and persisted event streaming.
- Worker packaging: both private queue handlers load from standalone build output without repository dependencies.
- Frontend tests: event decoding and session validation.
- Browser tests: routed demo entry, pagination, keyboard citation review, edit/approve/reload, account sign-in, mobile and offline states.

Tests mirror their owner under `backend/tests` and `frontend/tests`. A deterministic test verifies application behavior, not real model quality or provider availability. A hosted release also needs a small live OpenRouter check through the public UI, including source review and persisted approval. Record that evidence in the relevant planning task; do not infer it from a green build.
