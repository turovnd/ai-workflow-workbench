---
id: SD-T07
type: task
is_task_of: SD-S04
status: verified-local
depends_on: ['SD-T05', 'SD-T06']
---

# SD-T07: Inbox and source review interface

Parent story: [SD-S04](../stories/SD-S04.md).

## Goal

Let a reviewer find a ticket and inspect evidence without losing navigation state.

## Scope

URL filters, infinite query pages, scroll/manual load more, ticket workspace, source dialog and official shadcn composition.

## Dependencies

- [SD-T05](../tasks/SD-T05.md)
- [SD-T06](../tasks/SD-T06.md)

## Acceptance criteria

- [x] Stale pages cannot append after filter/session changes.
- [x] Source dialog has an accessible title, focus management and exact revision/quote.
- [x] Loading, empty, failure and offline mutation states are visible.

## Tests and verification

- Connected paging/source keyboard browser journey.
- Mobile layout and accessibility checks.

## Status

**verified-local**.

## Implementation evidence

The four current connected browser tests exercised real demo paging, exact source inspection and focus, reply review, mobile/offline controls and evidence-gap behavior. Component/page moves passed lint and typechecking.

Implementation and verification locations:

- [apps/web/src/pages/support/ticket-page.tsx](../../apps/web/src/pages/support/ticket-page.tsx)
- [apps/web/src/components/tickets/ticket-inbox.tsx](../../apps/web/src/components/tickets/ticket-inbox.tsx)
- [apps/web/src/components/evidence/source-dialog.tsx](../../apps/web/src/components/evidence/source-dialog.tsx)
- [tests/apps/web/src/pages/support.browser.test.ts](../../tests/apps/web/src/pages/support.browser.test.ts)
