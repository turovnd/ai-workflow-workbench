# Delivery status

Current local verification and hosted delivery status. Earlier records are preserved in the [archive](archive/README.md).

| Area                     | Evidence                                                                                                                                 | Current status                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Product baseline         | Real account/demo, cursor isolation and durable worker behavior passed the current local regression.                                     | Verified locally; deployed baseline remains recorded below.                                                                                |
| Public backend           | `https://workflow-api.b2p.space` passed HTTPS, health, auth, cursor/workspace isolation, durable processing and logout checks.           | Deployed.                                                                                                                                  |
| Backend image            | `turovnd-workflow:20261010-support.2` in `turovnd-workflow` with private PostgreSQL and loopback API port 4010.                          | Deployed baseline; refactor has not implicitly replaced it.                                                                                |
| Public UI                | [https://turovnd-support-desk.vercel.app](https://turovnd-support-desk.vercel.app) returned public HTTP 200 after Vercel reported READY. | Published.                                                                                                                                 |
| Vercel-to-API connection | Coordinator confirmed both exact-origin CORS and UI authentication from the production alias.                                            | Verified for the deployed baseline; full refactored journey pending.                                                                       |
| Source organization      | Runtime modules and tests now use the documented independent boundaries and mirrored root test tree.                                     | Verified locally.                                                                                                                          |
| Schema compatibility     | Both SQL migration files match the deployed Support image byte for byte.                                                                 | Verified by coordinator; structural release has no schema change.                                                                          |
| Swagger                  | `/docs` with local assets and `/openapi.json` are part of the current API delivery.                                                      | Verified locally; refactored public rollout pending.                                                                                       |
| Public Git repository    | Owner authorized `turovnd/ai-workflow-workbench` and Git-connected automatic deployment.                                                 | GitHub repository linked to the correct Vercel project through the official integration; first push and hosted build verification pending. |
| CI/CD                    | Workflow definitions and GitHub-to-Vercel linkage are configured for production main.                                                    | First source push, hosted CI and automatic build verification pending.                                                                     |
| Backups                  | Private persistent volume exists. Off-host backup and restore rehearsal are separate work.                                               | Not verified.                                                                                                                              |

## Verified baseline

Public HTTPS smoke used two independent demo workspaces, disjoint 12+12 cursor pages, cross-workspace cursor/ticket/run rejection, persisted queued-to-ready SSE, worker-created drafts, edited version approval with idempotent replay, persisted history/resolved ticket state and session revocation. Numeric cursor regression coverage includes the 9/10 and 99/100 boundaries. Static checks, real PostgreSQL tests and connected browser journeys were reported passed before this refactor.

Routine tests and public smoke use deterministic data and no paid model calls. The earlier implementation record reports a separately authorized live adapter smoke; that is not a recurring CI check or a model-quality evaluation.

## Current refactor evidence

The implementation owner verified the current layout locally:

- `npm run lint`, `npm run typecheck` (seven workspaces plus mirrored tests) and `npm run format:check` passed.
- `npm test`: 13 unit tests passed.
- `TEST_DATABASE_URL=<disposable PostgreSQL> npm run test:db`: 19 PostgreSQL/API tests passed.
- `npm run build`: independent web, API and worker builds passed.
- `npm audit --omit=dev` reported zero known production dependency vulnerabilities at execution; this is not a general security certification.
- Generated OpenAPI 3.1.0 describes 17 production operations. Tests verified business bearer security, public documentation and local Swagger assets.

- Four connected browser tests passed: demo/paging/source/edit/approval/history/reload, independent accounts and auth races, mobile/offline/evidence gaps, and Swagger with zero external requests.
- Native local Compose rebuilt; migration exited 0, API/worker/web were healthy and the existing volume was preserved.

No live-provider call was rerun during this refactor. The new public image release and hosted Git build remain pending.

## Outstanding delivery gates

1. Deploy the verified refactored image/build and recheck the public pair; the local structural/static/database/browser/container gate is complete.
2. Recheck the production UI/API complete durable workflow after the refactored release. Exact-origin CORS and current UI authentication already passed.
3. Push the reviewed source to the authorized public repository and verify the first hosted CI/build and automatic deployment. Repository-to-Vercel linkage is configured.
4. Verify backend release automation separately from Vercel UI delivery.
5. Configure and rehearse backup restoration before relying on retained account data.

See [planning](../planning/README.md) for task ownership, dependencies and acceptance criteria.
