---
id: SD-T03
type: task
is_task_of: SD-S02
---

# Cursor pagination

Story: [SD-S02](../stories/SD-S02.md).

Dependencies: [SD-T01](SD-T01.md).

## Acceptance criteria

- Use cursor and limit for inbox and history.
- Bind cursors to workspace and filter or ticket.
- Exclude later inserts from an in-progress traversal and support explicit refresh.

## Evidence and status

Verified locally: PostgreSQL cursor scope/order tests and browser inbox/history traversal pass.

- [backend/common/data/lib/cursor.ts](../../../backend/common/data/lib/cursor.ts)
- [frontend/src/components/pagination/load-more.tsx](../../../frontend/src/components/pagination/load-more.tsx)

Verification locations:

- [backend/tests/common/data/repositories/pagination.integration.test.ts](../../../backend/tests/common/data/repositories/pagination.integration.test.ts)
- [frontend/tests/src/pages/support.browser.test.ts](../../../frontend/tests/src/pages/support.browser.test.ts)
