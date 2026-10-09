---
id: SD-T15
type: task
is_task_of: SD-S08
status: verified-hosted
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

- [x] Migrations and readiness pass for a verified image.
- [x] A bounded public synthetic workflow proves worker and persistence.
- [x] Original unrelated services/configuration and own non-target containers remain unchanged.

## Tests and verification

- HTTPS auth/cursor/worker/logout smoke.
- Before/after container/image/config checks and targeted rollback rehearsal.

## Status

**verified-hosted**.

## Implementation evidence

Image `turovnd-workflow:20261010-support.3` is deployed with configuration digest `sha256:ca50cb6d994ef8b20d5e6986373ee194f83ff8d720c0e432e986a20caec243bc`. DB/migration containers were preserved, unchanged schema was verified and public HTTPS worker/auth/cursor/logout smoke passed. Final isolation checks preserved all 37 previously running unrelated containers and original nginx files.

Implementation and verification locations:

- [compose.yaml](../../compose.yaml)
- [Dockerfile](../../Dockerfile)
- [.github/workflows/release.yml](../../.github/workflows/release.yml)
- [docs/operations.md](../../docs/operations.md)
