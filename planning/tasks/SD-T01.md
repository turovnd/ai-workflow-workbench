---
id: SD-T01
type: task
is_task_of: SD-S01
status: verified-local
depends_on: []
---

# SD-T01: Runtime boundaries

Parent story: [SD-S01](../stories/SD-S01.md).

## Goal

Make module ownership explicit without changing the product contract.

## Scope

Move entrypoints, UI composition and shared code into the agreed runtime/layer tree; retain actual package exports and locked tools. Do not create a cross-repository dependency.

## Dependencies

No predecessor task. Follow the accepted product/hosting constraints and preserve existing behavior.

## Acceptance criteria

- [x] Application entrypoints contain composition rather than unrelated business operations.
- [x] Imports respect the documented runtime/layer boundary; Docker and frontend builds use the moved paths.

## Tests and verification

- Typecheck and application builds from a clean locked install.
- Import-boundary review and complete regression gate before release.

## Status

**verified-local**.

## Implementation evidence

Seven npm workspaces typechecked; independent web/API/worker builds passed. The local Compose stack rebuilt successfully, migration exited 0, API/worker/web became healthy and the existing volume was preserved. Runtime image compatibility paths are retained.

Implementation and verification locations:

- [package.json](../../package.json)
- [apps/api/src/app.ts](../../apps/api/src/app.ts)
- [packages/data/package.json](../../packages/data/package.json)
- [docs/architecture.md](../../docs/architecture.md)
