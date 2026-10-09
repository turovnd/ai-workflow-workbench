---
id: SD-T04
type: task
is_task_of: SD-S03
status: verified-local
depends_on: ['SD-T01']
---

# SD-T04: Account and demo sessions

Parent story: [SD-S03](../stories/SD-S03.md).

## Goal

Establish server-owned identity for every support action.

## Scope

Independent registration/login, isolated seeded demos, salted scrypt credentials, hashed revocable tokens, expiry and account-safe cleanup.

## Dependencies

- [SD-T01](../tasks/SD-T01.md)

## Acceptance criteria

- [x] Foreign tokens/IDs cannot access ticket, run, history or approval data.
- [x] Logout revokes the session; old responses cannot revive it; account data survives demo cleanup.

## Tests and verification

- Real PostgreSQL account/session, pool-size-one and foreign-workspace cases.
- Deferred frontend login/logout/401 race tests.

## Status

**verified-local**.

## Implementation evidence

Current PostgreSQL/API and connected browser runs passed account registration/login, independent demo identity, revocation, account-safe cleanup, foreign workspace rejection and bounded single-connection session creation.

Implementation and verification locations:

- [packages/data/src/repositories/auth.ts](../../packages/data/src/repositories/auth.ts)
- [packages/data/src/lib/password.ts](../../packages/data/src/lib/password.ts)
- [tests/packages/data/src/repositories/auth.integration.test.ts](../../tests/packages/data/src/repositories/auth.integration.test.ts)
- [tests/apps/api/src/routes/routes.integration.test.ts](../../tests/apps/api/src/routes/routes.integration.test.ts)
