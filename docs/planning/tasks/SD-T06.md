---
id: SD-T06
type: task
is_task_of: SD-S04
---

# Edit and approve a saved reply

Story: [SD-S04](../stories/SD-S04.md).

Dependencies: [SD-T05](SD-T05.md).

## Acceptance criteria

- Save edits with an expected draft version.
- Show the exact response before approval and reject stale or changed intent.
- Commit reply, history, optional internal escalation and idempotency receipt together.

## Evidence and status

Verified locally: concurrent/stale/idempotent approval database tests and browser edit → approve → reload checks pass. A real AI draft was reviewed, edited and approved in the local application.

- [frontend/src/components/replies/Editor.tsx](../../../frontend/src/components/replies/Editor.tsx)
- [backend/common/data/repositories/reply-approvals.ts](../../../backend/common/data/repositories/reply-approvals.ts)

Verification locations:

- [backend/tests/common/data/repositories/approvals.integration.test.ts](../../../backend/tests/common/data/repositories/approvals.integration.test.ts)
- [frontend/tests/src/pages/support.browser.test.ts](../../../frontend/tests/src/pages/support.browser.test.ts)
