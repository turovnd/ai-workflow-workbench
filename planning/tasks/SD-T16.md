---
id: SD-T16
type: task
is_task_of: SD-S08
status: verified-hosted
depends_on: ['SD-T13', 'SD-T15']
---

# SD-T16: Vercel UI and exact API origin

Parent story: [SD-S08](../stories/SD-S08.md).

## Goal

Make the published frontend usable against its real independent API.

## Scope

Build with the correct public API origin, use the exact stable Vercel alias in server CORS, and verify a full connected browser flow.

## Dependencies

- [SD-T13](../tasks/SD-T13.md)
- [SD-T15](../tasks/SD-T15.md)

## Acceptance criteria

- [x] The production alias serves the intended build with the correct API origin.
- [x] Browser auth, cross-origin API requests and one durable workflow complete.
- [x] No wildcard preview CORS and no silent browser-fixture substitution.

## Tests and verification

- Browser request/response and console review from the stable production alias.
- Session logout/revocation and mobile/keyboard smoke.

## Status

**verified-hosted**.

## Implementation evidence

The stable production UI reached READY from Git commit [5f9228975d9e](https://github.com/turovnd/ai-workflow-workbench/commit/5f9228975d9e77939842ab65a3a6aee395fbe2c7) in deployment `dpl_ARdtDjWoheTQAXkoiQvszfVRbM3v`. Public browser authentication/current server data passed with zero console errors; exact-origin CORS and the complete public deterministic API workflow passed. Production uses the real API origin; feature previews require separate setup.

Implementation and verification locations:

- [vercel.json](../../vercel.json)
- [apps/web/src/lib/api/client.ts](../../apps/web/src/lib/api/client.ts)
- [packages/config/src/environment.ts](../../packages/config/src/environment.ts)
- [docs/delivery-status.md](../../docs/delivery-status.md)
