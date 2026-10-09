# API and Swagger

Production API origin: `https://workflow-api.b2p.space`. Local origin: `http://127.0.0.1:4010`. Route paths below are relative to that origin, without `/api`; the local web proxy adds/removes `/api` at its boundary.

OpenAPI 3.1.0 is generated at `/openapi.json`; Swagger UI and its assets are served locally at `/docs/`. The document describes 17 production operations with Fastify request/response schemas, bearer security, errors and examples. [Public Swagger](https://workflow-api.b2p.space/docs/) and [OpenAPI](https://workflow-api.b2p.space/openapi.json) are deployed and verified; release evidence is in [delivery status](delivery-status.md).

## Route map

| Method/path                                     | Purpose                                                 | Authentication  |
| ----------------------------------------------- | ------------------------------------------------------- | --------------- |
| `GET /health`, `GET /capabilities`              | Readiness and generation mode.                          | Public          |
| `POST /auth/demo`                               | Create a synthetic demo workspace/session.              | Public, bounded |
| `POST /auth/register`, `POST /auth/login`       | Independent account registration/login.                 | Public, bounded |
| `GET /auth/me`, `POST /auth/logout`             | Session identity / revocation.                          | Bearer          |
| `GET /tickets`, `GET /tickets/{id}`             | Inbox page / ticket detail.                             | Bearer          |
| `GET /tickets/{id}/history`                     | Cursor-paged saved reply history.                       | Bearer          |
| `POST /tickets/{id}/runs`                       | Commit a reply run and durable job.                     | Bearer          |
| `GET /runs/{id}`                                | Authoritative run snapshot.                             | Bearer          |
| `GET /runs/{id}/events`                         | Replayable persisted SSE; `after` is a per-run cursor.  | Bearer          |
| `POST /runs/{id}/cancel`                        | Cancel unfinished work and invalidate its claim.        | Bearer          |
| `GET /runs/{id}/draft`, `POST /runs/{id}/draft` | Read/save a versioned draft.                            | Bearer          |
| `POST /runs/{id}/reply`                         | Approve the exact saved version with idempotent intent. | Bearer          |

Swagger's **Authorize** control accepts a token obtained from this API. Never paste production secrets or another app's session into examples. Demo mutation requires explicit action; opening documentation must not create a session or call a model.

## Cursor and mutation contract

List requests accept `limit` 1–50 and an opaque cursor. Ticket status filters and history ticket identity are part of cursor scope. Numeric descending keysets and a first-page insertion ceiling exclude later inserts; existing status membership can change. Refresh after relevant mutations. Invalid/tampered or foreign-scope cursors fail; do not parse or construct a cursor in the client.

Draft save/approval use expected versions. Approval carries a workspace-scoped idempotency key and validated intent. An identical retry returns the committed receipt before stale-state rejection; a conflicting reuse or changed saved version fails visibly. The API transaction persists the reviewed content, history, optional internal escalation and receipt. No outbound email is sent.

Validation errors, unauthorized sessions, missing/foreign objects, version/idempotency conflicts and admission limits remain distinct HTTP failures. Exact schemas and status codes belong to the generated OpenAPI plus route tests, not a second handwritten schema copy.

See [auth](auth-tenancy.md), [workflows](workflows.md) and [limits](limits.md).
