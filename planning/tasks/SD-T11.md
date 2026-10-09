---
id: SD-T11
type: task
is_task_of: SD-S06
status: verified-local
depends_on: ['SD-T04', 'SD-T10']
---

# SD-T11: Versioned draft edit and approval

Parent story: [SD-S06](../stories/SD-S06.md).

## Goal

Persist exactly the reply version the reviewer approved.

## Scope

Expected draft versions, visible user edits, canonical idempotent intent and atomic reply/history/escalation/receipt transaction.

## Dependencies

- [SD-T04](../tasks/SD-T04.md)
- [SD-T10](../tasks/SD-T10.md)

## Acceptance criteria

- [x] Identical retry replays before stale-state checks; changed intent conflicts.
- [x] A stale editor must reload; approval stores exact reviewed content.
- [x] Rollback creates no partial reply/history; no email is sent.

## Tests and verification

- Concurrent approval/replay/conflict and rollback PostgreSQL tests.
- Long UTF-8 draft, edit/approve/reload and public history checks.

## Status

**verified-local**.

## Implementation evidence

Current PostgreSQL approval/draft tests and connected browser edit/approve/history/reload journey passed. Coverage includes exact saved versions, concurrent idempotency/replay/conflict, rollback, workspace isolation and long UTF-8 drafts.

Implementation and verification locations:

- [packages/data/src/repositories/drafts.ts](../../packages/data/src/repositories/drafts.ts)
- [packages/data/src/repositories/reply-approvals.ts](../../packages/data/src/repositories/reply-approvals.ts)
- [apps/api/src/routes/drafts.ts](../../apps/api/src/routes/drafts.ts)
- [tests/packages/data/src/repositories/approvals.integration.test.ts](../../tests/packages/data/src/repositories/approvals.integration.test.ts)
