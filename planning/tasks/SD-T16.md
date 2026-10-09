---
id: SD-T16
type: task
is_task_of: SD-S08
status: pending
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

- [ ] The production alias serves the intended build with the correct API origin.
- [ ] Browser auth, cross-origin API requests and one durable workflow complete.
- [ ] No wildcard preview CORS and no silent browser-fixture substitution.

## Tests and verification

- Browser request/response and console review from the stable production alias.
- Session logout/revocation and mobile/keyboard smoke.

## Status

**pending**.

## Implementation evidence

Vercel reported READY and the stable production alias returned HTTP 200. Coordinator also confirmed exact-origin CORS and UI authentication. A complete refactored browser workflow remains pending.

Implementation and verification locations:

- [vercel.json](../../vercel.json)
- [apps/web/src/lib/api/client.ts](../../apps/web/src/lib/api/client.ts)
- [packages/config/src/environment.ts](../../packages/config/src/environment.ts)
- [docs/delivery-status.md](../../docs/delivery-status.md)
