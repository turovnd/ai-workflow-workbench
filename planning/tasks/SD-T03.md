---
id: SD-T03
type: task
is_task_of: SD-S02
status: verified-local
depends_on: ['SD-T01']
---

# SD-T03: Generated API contract and Swagger

Parent story: [SD-S02](../stories/SD-S02.md).

## Goal

Let a reviewer inspect and exercise the real API contract.

## Scope

Generate OpenAPI from actual request/response schemas; group operations, document bearer security/errors/examples and serve Swagger assets locally.

## Dependencies

- [SD-T01](../tasks/SD-T01.md)

## Acceptance criteria

- [x] GET /openapi.json describes all public application routes and exact auth requirements.
- [x] /docs loads its own assets; opening documentation creates no session and makes no provider call.
- [x] Examples use synthetic values and contain no credentials.

## Tests and verification

- Contract tests compare route paths/security/models to the generated document.
- HTTP/browser check for Swagger assets, authorizing and one deterministic request.

## Status

**verified-local**.

## Implementation evidence

OpenAPI 3.1.0 covers 17 production operations. PostgreSQL/API checks verified request/response contracts, bearer security and public docs/assets. The Swagger browser check passed with zero external requests.

Implementation and verification locations:

- [apps/api/src/plugins/documentation.ts](../../apps/api/src/plugins/documentation.ts)
- [apps/api/src/schemas/responses.ts](../../apps/api/src/schemas/responses.ts)
- [tests/apps/api/src/plugins/documentation.integration.test.ts](../../tests/apps/api/src/plugins/documentation.integration.test.ts)
- [tests/apps/api/src/plugins/documentation.browser.test.ts](../../tests/apps/api/src/plugins/documentation.browser.test.ts)
