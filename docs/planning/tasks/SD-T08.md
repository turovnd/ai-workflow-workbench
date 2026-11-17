---
id: SD-T08
type: task
is_task_of: SD-S05
---

# Visible progress and history

Story: [SD-S05](../stories/SD-S05.md).

Dependencies: [SD-T07](SD-T07.md).

## Acceptance criteria

- React immediately to preparation requests.
- Recover updates after connection loss without requiring a pause/resume control.
- Allow reopening saved preparations and keep failures visible.

## Evidence and status

Verified locally: immediate progress, recovery with an interrupted event stream, paged history and reopening saved preparations pass in the browser.

- [frontend/src/hooks/use-ticket-workspace.ts](../../../frontend/src/hooks/use-ticket-workspace.ts)
- [frontend/src/components/replies/Preparation.tsx](../../../frontend/src/components/replies/Preparation.tsx)
- [frontend/src/components/tickets/History.tsx](../../../frontend/src/components/tickets/History.tsx)

Verification locations:

- [frontend/tests/src/pages/support.browser.test.ts](../../../frontend/tests/src/pages/support.browser.test.ts)
