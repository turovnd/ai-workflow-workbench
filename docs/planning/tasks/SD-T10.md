---
id: SD-T10
type: task
is_task_of: SD-S06
---

# Independent deployment and verification

Story: [SD-S06](../stories/SD-S06.md).

Dependencies: [SD-T09](SD-T09.md), [SD-T07](SD-T07.md), [SD-T06](SD-T06.md).

## Acceptance criteria

- Deploy frontend, API and private worker through Git to Vercel with a separate Neon database.
- Keep model credentials on the worker and preview data isolated from production.
- Verify the public demo with real AI, source review, approval and reload.
- Document setup, failure recovery and honest product limits.

## Evidence and status

Local Docker and five browser scenarios pass. A separate Neon Free resource named support-desk has been created. Hosted migration is pending Vercel identity verification and confirmation of the project transfer; the new services and live AI flow have not yet been verified on Vercel.

- [vercel.json](../../../vercel.json)
- [compose.yaml](../../../compose.yaml)
- [.github/workflows/ci.yml](../../../.github/workflows/ci.yml)
- [docs/vercel.md](../../../docs/vercel.md)

Verification locations:

- [frontend/tests/src/pages/support.browser.test.ts](../../../frontend/tests/src/pages/support.browser.test.ts)
