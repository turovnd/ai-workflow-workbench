---
id: SD-T07
type: task
is_task_of: SD-S05
---

# Durable jobs and queue recovery

Story: [SD-S05](../stories/SD-S05.md).

Dependencies: [SD-T05](SD-T05.md).

## Acceptance criteria

- Commit run and job before notifying the queue.
- Claim one expiring lease and fence stale completion or cancellation.
- Recover missed notifications and expired leases; terminate after three attempts.

## Evidence and status

Database and local worker behavior verified: targeted claims, duplicate delivery, expired leases, fencing, cancellation and transient/terminal provider errors pass against PostgreSQL. On 2026-11-17, Vercel Queues delivered live jobs in preview and production; both production jobs finished in one provider attempt. Both queue consumers are packaged as private functions. Scheduled recovery is configured for every 30 minutes; failure/recovery semantics are covered by PostgreSQL integration tests, not a claimed production fault-injection exercise.

- [backend/common/data/repositories/jobs.ts](../../../backend/common/data/repositories/jobs.ts)
- [backend/modules/worker/process.ts](../../../backend/modules/worker/process.ts)
- [backend/modules/worker/api/recovery.ts](../../../backend/modules/worker/api/recovery.ts)

Verification locations:

- [backend/tests/common/data/repositories/jobs.integration.test.ts](../../../backend/tests/common/data/repositories/jobs.integration.test.ts)

- [Worker failure and duplicate-delivery checks](../../../backend/tests/modules/worker/process.integration.test.ts)
