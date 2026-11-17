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
- Keep model credentials server-side, consume them only in worker code and isolate preview data from production.
- Verify the public demo with real AI, source review, approval and reload.
- Document setup, failure recovery and honest product limits.

## Evidence and status

Deployed and verified on 2026-11-17 at [Support Desk](https://turovnd-support-desk.vercel.app). Git pushes to `main` deploy the frontend, Fastify API and two private worker functions together. The independent Neon database contains the migrated account and approved reply; preview uses a separate database branch, with preview-created records absent from production.

[CI](https://github.com/turovnd/ai-workflow-workbench/actions/runs/44116125008) passed formatting, lint, types, unit and PostgreSQL checks, generated-client validation, Docker builds, isolated worker bundle loading and five browser scenarios. The local Docker stack was rebuilt from the published source.

Public checks passed: demo entry, two real OpenRouter preparations, citation review, edited approval, internal escalation and reload. Database records confirm one provider attempt per production job and persisted approval. Swagger serves 17 operations at `/docs`; `/docs/` redirects there, static assets and `/openapi.json` respond, and direct requests to private queue consumers return 404. These live checks are a small deployment check, not a load test or a general model-quality benchmark.

- [vercel.json](../../../vercel.json)
- [compose.yaml](../../../compose.yaml)
- [.github/workflows/ci.yml](../../../.github/workflows/ci.yml)
- [docs/vercel.md](../../../docs/vercel.md)

Verification locations:

- [frontend/tests/src/pages/support.browser.test.ts](../../../frontend/tests/src/pages/support.browser.test.ts)
