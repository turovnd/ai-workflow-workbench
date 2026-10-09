---
id: SD-T15
type: task
is_task_of: SD-S08
status: verified-baseline
depends_on: ['SD-T13']
---

# SD-T15: Isolated backend delivery

Parent story: [SD-S08](../stories/SD-S08.md).

## Goal

Run this API, worker and database without disturbing unrelated server services.

## Scope

Use the own Compose project, private database/network/volume, loopback API, versioned image, exact proxy trust, TLS and bounded resources/logs.

## Dependencies

- [SD-T13](../tasks/SD-T13.md)

## Acceptance criteria

- [ ] Migrations and readiness pass for a verified image.
- [ ] A bounded public synthetic workflow proves worker and persistence.
- [ ] Original unrelated services/configuration and own non-target containers remain unchanged.

## Tests and verification

- HTTPS auth/cursor/worker/logout smoke.
- Before/after container/image/config checks and targeted rollback rehearsal.

## Status

**verified-baseline**.

## Implementation evidence

The baseline API/worker/PostgreSQL deployment and public smoke passed. The refactored release still depends on T13 and a new targeted rollout.

Implementation and verification locations:

- [compose.yaml](../../compose.yaml)
- [Dockerfile](../../Dockerfile)
- [.github/workflows/release.yml](../../.github/workflows/release.yml)
- [docs/operations.md](../../docs/operations.md)
