---
id: SD-T01
type: task
is_task_of: SD-S01
---

# Account and demo sessions

Story: [SD-S01](../stories/SD-S01.md).

Dependencies: None.

## Acceptance criteria

- Provide demo, register, sign-in and sign-out routes.
- Scope reads and mutations to server-owned workspace identity.
- Clear browser state on session replacement and reject late responses.

## Evidence and status

Verified locally: PostgreSQL account isolation and browser register/sign-in/sign-out checks pass.

- [backend/modules/api/routes/auth.ts](../../../backend/modules/api/routes/auth.ts)
- [backend/common/data/repositories/auth.ts](../../../backend/common/data/repositories/auth.ts)
- [frontend/src/hooks/auth.tsx](../../../frontend/src/hooks/auth.tsx)

Verification locations:

- [backend/tests/common/data/repositories/auth.integration.test.ts](../../../backend/tests/common/data/repositories/auth.integration.test.ts)
- [frontend/tests/src/pages/support.browser.test.ts](../../../frontend/tests/src/pages/support.browser.test.ts)
