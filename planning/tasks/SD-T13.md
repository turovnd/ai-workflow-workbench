---
id: SD-T13
type: task
is_task_of: SD-S07
status: verified-local
depends_on: ['SD-T01', 'SD-T02', 'SD-T03', 'SD-T12']
---

# SD-T13: Regression and release evidence

Parent story: [SD-S07](../stories/SD-S07.md).

## Goal

Prove the reorganized application still works as a complete system.

## Scope

Execute static checks, units, real PostgreSQL integration, browser journeys and container builds; distinguish local results from hosted CI and deployed smoke.

## Dependencies

- [SD-T01](../tasks/SD-T01.md)
- [SD-T02](../tasks/SD-T02.md)
- [SD-T03](../tasks/SD-T03.md)
- [SD-T12](../tasks/SD-T12.md)

## Acceptance criteria

- [x] Every required command is recorded with actual outcome and scope.
- [x] Database checks run against disposable real PostgreSQL, not only mocks.
- [x] Connected browser journey passes through API, separate worker and persistence.

## Tests and verification

- Full command matrix in docs/testing.md.
- Review failure artifacts and rerun affected checks after fixes.

## Status

**verified-local**.

## Implementation evidence

Final local gate passed: lint, formatting, seven-workspace/test typecheck, 13 unit, 19 PostgreSQL/API and four connected browser tests; independent production builds; native Compose rebuild with migration exit 0 and healthy API/worker/web. Production dependency audit reported zero known vulnerabilities at execution. Hosted CI and the new public release remain separate tasks.

Implementation and verification locations:

- [package.json](../../package.json)
- [.github/workflows/ci.yml](../../.github/workflows/ci.yml)
- [docs/testing.md](../../docs/testing.md)
- [tests/apps/web/src/pages/support.browser.test.ts](../../tests/apps/web/src/pages/support.browser.test.ts)
