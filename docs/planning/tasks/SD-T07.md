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

Database and local worker behavior verified: targeted claims, duplicate delivery, expired leases, fencing, cancellation and transient/terminal provider errors pass against PostgreSQL. Vercel queue delivery remains part of SD-T10 hosted verification.

- [backend/common/data/repositories/jobs.ts](../../../backend/common/data/repositories/jobs.ts)
- [backend/modules/worker/process.ts](../../../backend/modules/worker/process.ts)
- [backend/modules/worker/api/recovery.ts](../../../backend/modules/worker/api/recovery.ts)

Verification locations:

- [backend/tests/common/data/repositories/jobs.integration.test.ts](../../../backend/tests/common/data/repositories/jobs.integration.test.ts)

- [Worker failure and duplicate-delivery checks](../../../backend/tests/modules/worker/process.integration.test.ts)
