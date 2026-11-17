---
id: SD-T02
type: task
is_task_of: SD-S02
---

# Routed inbox and request pages

Story: [SD-S02](../stories/SD-S02.md).

Dependencies: [SD-T01](SD-T01.md).

## Acceptance criteria

- Use separate auth, inbox and ticket-detail pages with direct navigation.
- Make the first demo request and its intended review flow obvious.
- Provide mobile, loading, empty, error and offline states.

## Evidence and status

Verified locally: routed demo, deep links, keyboard navigation, accessibility, mobile and offline browser checks pass.

- [frontend/src/router/Router.tsx](../../../frontend/src/router/Router.tsx)
- [frontend/src/pages/tickets/index.tsx](../../../frontend/src/pages/tickets/index.tsx)
- [frontend/src/pages/ticket-details/index.tsx](../../../frontend/src/pages/ticket-details/index.tsx)

Verification locations:

- [frontend/tests/src/pages/support.browser.test.ts](../../../frontend/tests/src/pages/support.browser.test.ts)
