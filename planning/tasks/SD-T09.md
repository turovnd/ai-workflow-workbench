---
id: SD-T09
type: task
is_task_of: SD-S05
status: verified-local
depends_on: ['SD-T08']
---

# SD-T09: Bounded optional model adapter

Parent story: [SD-S05](../stories/SD-S05.md).

## Goal

Offer opt-in generation without unbounded calls or unsupported output.

## Scope

Strict structured output, timeout/token/response bounds, exact evidence validation, durable global attempt reservations and workspace admission.

## Dependencies

- [SD-T08](../tasks/SD-T08.md)

## Acceptance criteria

- [x] Live mode requires explicit mode/switch/key/budget; deterministic default makes no model call.
- [x] Invalid/provider failures remain visible without fallback.
- [x] Reservations survive restarts and concurrent fresh workspaces.

## Tests and verification

- Injected HTTP provider contract tests and persistent budget PostgreSQL tests.
- Live smoke only when separately authorized, with no quality-score claim.

## Status

**verified-local**.

## Implementation evidence

Injected OpenRouter contract tests and real PostgreSQL durable admission tests passed after restructuring. Mode/enablement/key gates, output/evidence validation and persistent attempt budgets were checked without a new paid provider call.

Implementation and verification locations:

- [packages/knowledge/src/provider.ts](../../packages/knowledge/src/provider.ts)
- [packages/data/src/repositories/generation.ts](../../packages/data/src/repositories/generation.ts)
- [tests/packages/knowledge/src/provider.unit.test.ts](../../tests/packages/knowledge/src/provider.unit.test.ts)
- [tests/packages/data/src/repositories/generation.integration.test.ts](../../tests/packages/data/src/repositories/generation.integration.test.ts)
