---
id: SD-T05
type: task
is_task_of: SD-S03
---

# Real OpenRouter generation

Story: [SD-S03](../stories/SD-S03.md).

Dependencies: [SD-T04](SD-T04.md).

## Acceptance criteria

- Send the actual customer message and retrieved articles to OpenRouter.
- Validate structured output and exact source quotes; never substitute sample output on failure.
- Ask for clarification when knowledge is missing; bound time, bytes, tokens and retries.

## Evidence and status

Verified locally with OpenRouter / openai/gpt-4.1-mini: three requests completed, including a source-backed reply and a missing-policy clarification. The instruction was tightened after observing unsupported assumptions. Unit tests cover fabricated quotes, bounded response bytes, provider rejection and interrupted responses. This is a small live check, not a general model-quality benchmark.

- [backend/common/knowledge/openrouter/index.ts](../../../backend/common/knowledge/openrouter/index.ts)
- [backend/common/knowledge/openrouter/transport.ts](../../../backend/common/knowledge/openrouter/transport.ts)

Verification locations:

- [backend/tests/common/knowledge/provider.unit.test.ts](../../../backend/tests/common/knowledge/provider.unit.test.ts)
- [backend/tests/common/data/repositories/generation.integration.test.ts](../../../backend/tests/common/data/repositories/generation.integration.test.ts)
