---
id: SD-T12
type: task
is_task_of: SD-S06
status: verified-local
depends_on: ['SD-T07', 'SD-T10', 'SD-T11']
---

# SD-T12: Persisted progress and recovery UI

Parent story: [SD-S06](../stories/SD-S06.md).

## Goal

Show honest preparation progress and recover after connection loss.

## Scope

Persisted per-run SSE, bounded connection, cursor replay/deduplication, final snapshot, cancellation and offline mutation guards.

## Dependencies

- [SD-T07](../tasks/SD-T07.md)
- [SD-T10](../tasks/SD-T10.md)
- [SD-T11](../tasks/SD-T11.md)

## Acceptance criteria

- [x] Progress comes from persisted events; UI does not fake token streaming.
- [x] Duplicate/replayed frames do not regress state; terminal snapshot reconciles.
- [x] Disconnect does not cancel a durable job; cancellation is explicit.

## Tests and verification

- SSE parser/frame and HTTP persistence/flush tests.
- Browser reconnect/error/cancel and public queued-to-ready flow.

## Status

**verified-local**.

## Implementation evidence

Current SSE parser and HTTP event tests passed; the connected browser flow completed persisted reply preparation and authoritative final state. Mobile/offline and cancellation boundaries remained covered by the current suites.

Implementation and verification locations:

- [apps/api/src/routes/events.ts](../../apps/api/src/routes/events.ts)
- [apps/web/src/hooks/use-run-stream.ts](../../apps/web/src/hooks/use-run-stream.ts)
- [apps/web/src/lib/api/events.ts](../../apps/web/src/lib/api/events.ts)
- [tests/apps/web/src/lib/api/events.unit.test.ts](../../tests/apps/web/src/lib/api/events.unit.test.ts)
