---
id: SD-T05
type: task
is_task_of: SD-S03
status: verified-local
depends_on: ['SD-T04']
---

# SD-T05: Guarded auth and session UI

Parent story: [SD-S03](../stories/SD-S03.md).

## Goal

Keep private UI data attached to the active identity.

## Scope

Compose login/register/demo screens, session storage, guarded queries, clear-on-logout behavior and readable authentication errors.

## Dependencies

- [SD-T04](../tasks/SD-T04.md)

## Acceptance criteria

- [x] No private query data crosses sessions.
- [x] A stale 401 from an old token cannot clear a new session.
- [x] Authentication is usable with keyboard and narrow viewport.

## Tests and verification

- Controlled deferred request unit tests.
- Connected account/demo/login/logout browser journeys.

## Status

**verified-local**.

## Implementation evidence

Current deferred-session units and connected account browser checks passed. Private UI data is scoped to the active session, late responses are guarded, and keyboard/narrow-screen authentication was exercised.

Implementation and verification locations:

- [apps/web/src/pages/auth/auth-page.tsx](../../apps/web/src/pages/auth/auth-page.tsx)
- [apps/web/src/lib/api/client.ts](../../apps/web/src/lib/api/client.ts)
- [tests/apps/web/src/lib/api/session.unit.test.ts](../../tests/apps/web/src/lib/api/session.unit.test.ts)
- [tests/apps/web/src/pages/support.browser.test.ts](../../tests/apps/web/src/pages/support.browser.test.ts)
