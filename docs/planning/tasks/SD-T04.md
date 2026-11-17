---
id: SD-T04
type: task
is_task_of: SD-S03
---

# Current evidence and realistic requests

Story: [SD-S03](../stories/SD-S03.md).

Dependencies: None.

## Acceptance criteria

- Seed varied synthetic requests with context, prior attempts and constraints.
- Retrieve only current articles for the known ticket topic.
- Expose article revision and exact source text during review.

## Evidence and status

Verified locally: current-revision retrieval tests pass; the demo contains 18 distinct requests. Citation review was also exercised with a real OpenRouter response.

- [backend/common/knowledge/fixtures.ts](../../../backend/common/knowledge/fixtures.ts)
- [backend/common/knowledge/corpus.ts](../../../backend/common/knowledge/corpus.ts)
- [frontend/src/components/evidence/Panel.tsx](../../../frontend/src/components/evidence/Panel.tsx)

Verification locations:

- [backend/tests/common/knowledge/retrieval.unit.test.ts](../../../backend/tests/common/knowledge/retrieval.unit.test.ts)
