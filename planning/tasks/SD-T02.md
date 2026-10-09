---
id: SD-T02
type: task
is_task_of: SD-S01
status: verified-local
depends_on: ['SD-T01']
---

# SD-T02: One mirrored test tree

Parent story: [SD-S01](../stories/SD-S01.md).

## Goal

Give every test a discoverable production owner.

## Scope

Move existing automated suites into root tests/ following production paths; update runner, fixture, CI and browser discovery without dropping assertions.

## Dependencies

- [SD-T01](../tasks/SD-T01.md)

## Acceptance criteria

- [x] One root application test tree mirrors the production tree.
- [x] All previously discovered suites are still discovered; source folders contain no duplicated tests.

## Tests and verification

- Compare test discovery before/after the move.
- Run unit, real PostgreSQL and browser suites through their public scripts.

## Status

**verified-local**.

## Implementation evidence

The root mirrored tree discovered and passed 13 unit, 19 real PostgreSQL/API and four browser tests. API documentation tests mirror the plugins path; production source has no duplicate application suite.

Implementation and verification locations:

- [vitest.config.ts](../../vitest.config.ts)
- [playwright.config.ts](../../playwright.config.ts)
- [package.json](../../package.json)
- [tests/packages/data/helpers.ts](../../tests/packages/data/helpers.ts)
