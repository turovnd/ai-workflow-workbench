---
id: SD-T06
type: task
is_task_of: SD-S04
status: verified-local
depends_on: ['SD-T04']
---

# SD-T06: Ticket and history cursor paging

Parent story: [SD-S04](../stories/SD-S04.md).

## Goal

Browse bounded history and inbox pages without overlap or scope leaks.

## Scope

Numeric descending keysets, first-page insertion ceiling, signed workspace/filter/ticket cursors, SQL limits and explicit refresh semantics.

## Dependencies

- [SD-T04](../tasks/SD-T04.md)

## Acceptance criteria

- [x] 12+12 pages are disjoint and ordering stays numeric at 9/10 and 99/100.
- [x] Foreign/tampered/filter-mismatched cursors fail.
- [x] New inserts require refresh; live status membership is documented honestly.

## Tests and verification

- Real PostgreSQL digit-boundary and cursor-scope regressions.
- Public pagination smoke and filter/reset browser checks.

## Status

**verified-local**.

## Implementation evidence

Current PostgreSQL cursor regressions passed numeric 9/10 and 99/100 ordering, insertion ceilings, workspace/filter/tamper rejection and disjoint pages. The connected browser run exercised real inbox pagination.

Implementation and verification locations:

- [packages/data/src/repositories/tickets.ts](../../packages/data/src/repositories/tickets.ts)
- [packages/data/src/repositories/history.ts](../../packages/data/src/repositories/history.ts)
- [packages/data/src/lib/cursor.ts](../../packages/data/src/lib/cursor.ts)
- [tests/packages/data/src/repositories/pagination.integration.test.ts](../../tests/packages/data/src/repositories/pagination.integration.test.ts)
