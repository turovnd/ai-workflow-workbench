---
id: SD-T08
type: task
is_task_of: SD-S05
status: verified-local
depends_on: ['SD-T01']
---

# SD-T08: Current knowledge and provenance

Parent story: [SD-S05](../stories/SD-S05.md).

## Goal

Ground preparation in current synthetic help content.

## Scope

PostgreSQL lexical retrieval over current revisions, bounded evidence and exact citation/source validation; clarification on missing evidence.

## Dependencies

- [SD-T01](../tasks/SD-T01.md)

## Acceptance criteria

- [x] Archived revisions are excluded from current evidence.
- [x] Every accepted citation belongs to retrieved current source and quotes it exactly.
- [x] Missing support does not invent a retention promise.

## Tests and verification

- Knowledge unit tests for current revisions, exact quotes and evidence gaps.
- Real retrieval and no-evidence browser flow.

## Status

**verified-local**.

## Implementation evidence

Current retrieval/provenance units and real-database generation paths passed. The connected evidence-gap journey requests clarification; current lexical sources and exact quotes remain the retrieval boundary.

Implementation and verification locations:

- [packages/knowledge/src/corpus.ts](../../packages/knowledge/src/corpus.ts)
- [packages/knowledge/src/brief.ts](../../packages/knowledge/src/brief.ts)
- [packages/data/src/repositories/generation.ts](../../packages/data/src/repositories/generation.ts)
- [tests/packages/knowledge/src/retrieval.unit.test.ts](../../tests/packages/knowledge/src/retrieval.unit.test.ts)
