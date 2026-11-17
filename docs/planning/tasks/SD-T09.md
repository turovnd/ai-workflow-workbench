---
id: SD-T09
type: task
is_task_of: SD-S06
---

# Structure, migrations and generated contracts

Story: [SD-S06](../stories/SD-S06.md).

Dependencies: None.

## Acceptance criteria

- Separate frontend, API, worker and shared backend code.
- Apply journaled migrations separately from request startup.
- Serve Swagger and generate the frontend client from the API schema.
- Keep tests beside their owning frontend/backend tree and format hand-written code.

## Evidence and status

Verified locally: formatting, lint, types, generated-client comparison, build and Swagger browser checks pass. The old server database was restored into an isolated local database; applying journaled migrations preserved its one account and one saved reply.

- [backend/common/data/migrations.ts](../../../backend/common/data/migrations.ts)
- [backend/modules/api/plugins/documentation.ts](../../../backend/modules/api/plugins/documentation.ts)
- [frontend/tools/generate-api.mjs](../../../frontend/tools/generate-api.mjs)

Verification locations:

- [backend/tests/modules/api/plugins/documentation.integration.test.ts](../../../backend/tests/modules/api/plugins/documentation.integration.test.ts)
- [frontend/tests/api/documentation.browser.test.ts](../../../frontend/tests/api/documentation.browser.test.ts)
