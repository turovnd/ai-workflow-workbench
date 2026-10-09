---
id: SD-T10
type: task
is_task_of: SD-S06
status: verified-local
depends_on: ['SD-T08', 'SD-T09']
---

# SD-T10: Durable reply jobs and cancellation

Parent story: [SD-S06](../stories/SD-S06.md).

## Goal

Resume committed reply work safely after crashes.

## Scope

Atomic run/job creation, leases, fences, bounded redelivery, cancellation and terminal failures with provider calls outside transactions.

## Dependencies

- [SD-T08](../tasks/SD-T08.md)
- [SD-T09](../tasks/SD-T09.md)

## Acceptance criteria

- [x] A committed job survives no worker and is later processed.
- [x] Competing claims and stale/cancelled completions cannot duplicate or overwrite stored effects.
- [x] Exhaustion terminates visibly and lock ordering avoids cancellation deadlock.

## Tests and verification

- Real PostgreSQL concurrent claim, lease expiry, stale completion and cancellation-order cases.
- Separate worker connected smoke.

## Status

**verified-local**.

## Implementation evidence

Current real PostgreSQL job tests passed atomic admission, competing claims, expiry recovery, stale completion, exhausted attempts and cancellation lock ordering. The rebuilt separate worker completed the connected browser reply flow.

Implementation and verification locations:

- [packages/data/src/repositories/jobs.ts](../../packages/data/src/repositories/jobs.ts)
- [apps/worker/src/main.ts](../../apps/worker/src/main.ts)
- [tests/packages/data/src/repositories/jobs.integration.test.ts](../../tests/packages/data/src/repositories/jobs.integration.test.ts)
