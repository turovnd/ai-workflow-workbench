# Testing and verification

All automated application tests belong under root `tests/`, mirroring `apps/` and `packages/`. Product browser journeys live under `tests/apps/web/src/pages`; Swagger browser checks mirror `tests/apps/api/src/plugins`. Playwright discovers `tests/apps/**/*.browser.test.ts`; there is no second root `e2e/` suite. Shared test support may live at the nearest common test ancestor.

## Commands

Run from the repository root after `npm ci`:

```sh
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

For PostgreSQL guarantees, set `TEST_DATABASE_URL` to a **disposable real PostgreSQL database** and run `npm run test:db`. Fixtures truncate their target; never point them at the deployed database. For connected browser journeys, install Chromium with `npx playwright install chromium`, start the local Docker stack, then run `npm run test:e2e`.

The current command matrix passed locally; exact counts and scope are recorded in [delivery status](delivery-status.md).

## Coverage responsibilities

| Test layer                | Behavior                                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contracts/knowledge unit  | Strict provider output, exact source provenance, missing evidence and invalid shapes.                                                                                   |
| Browser library/hook unit | SSE frames and delayed session responses; stale results do not replace current identity.                                                                                |
| Real PostgreSQL           | Atomic approval/replay/conflict, rollback, cross-workspace access, lease/fence recovery, cancellation ordering, single-connection session creation and durable budgets. |
| Cursor regression         | Numeric ordering across 9/10 and 99/100, insertion ceiling, scope/filter/tamper rejection and no page overlap.                                                          |
| HTTP/OpenAPI              | Authentication, route schemas/errors, SSE persistence/flush, Swagger assets and generated contract consistency.                                                         |
| Connected browser         | Account/demo, paging, source keyboard/focus, edit/save/approve/reload, no-evidence, mobile/offline mutation guards and accessibility checks.                            |

Use deterministic inputs and controlled promises/clocks where practical. A provider fake tests the adapter contract, not remote model availability. A public health request does not prove worker progress. CI definitions are local source until an actual hosted run completes; Vercel and backend delivery are verified separately.
