# Delivery status

**[Live UI](https://turovnd-support-desk.vercel.app)** · [Swagger](https://workflow-api.b2p.space/docs/) · [OpenAPI](https://workflow-api.b2p.space/openapi.json) · [Public repository](https://github.com/turovnd/ai-workflow-workbench)

Production UI deployment from Git `main` is verified. The current API/worker image is deployed, its public workflow checks passed, and GitHub CI succeeded for the source revision linked below.

## Hosted release

| Area                   | Verified evidence                                                                                                                                                                                                                                                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend               | Vercel deployment `dpl_ARdtDjWoheTQAXkoiQvszfVRbM3v` reached READY from Git, production `main`.                                                                                                                                                                                                                                     |
| Source revision        | [5f9228975d9e77939842ab65a3a6aee395fbe2c7](https://github.com/turovnd/ai-workflow-workbench/commit/5f9228975d9e77939842ab65a3a6aee395fbe2c7).                                                                                                                                                                                       |
| Backend image          | `turovnd-workflow:20261010-support.3`; image configuration digest `sha256:ca50cb6d994ef8b20d5e6986373ee194f83ff8d720c0e432e986a20caec243bc`.                                                                                                                                                                                        |
| Public Swagger         | HTTPS 200 and 17 operations rendered with local assets; interactive Try it out → Execute returned an actual server response 200 from `GET /health`.                                                                                                                                                                                 |
| Browser/API connection | Production UI authentication and current server data passed; zero console errors. Exact-origin CORS covers the stable production alias.                                                                                                                                                                                             |
| Database compatibility | Both SQL migration files were byte-identical to the preceding deployed image. No schema change was applied.                                                                                                                                                                                                                         |
| Runtime isolation      | Only this app’s API/worker were replaced. Existing DB/migration containers and data were preserved.                                                                                                                                                                                                                                 |
| GitHub CI              | [Run 38000404242](https://github.com/turovnd/ai-workflow-workbench/actions/runs/38000404242) succeeded for source revision [5f9228975d9e](https://github.com/turovnd/ai-workflow-workbench/commit/5f9228975d9e77939842ab65a3a6aee395fbe2c7); the `verify` job passed static, unit, PostgreSQL, build, container and browser checks. |
| Recovery               | Off-host backups and restore rehearsal remain unverified.                                                                                                                                                                                                                                                                           |

CI evidence applies to the linked source revision; later documentation commits are checked independently.

## Public workflow verification

The bounded combined HTTPS smoke for both new releases passed: 46 requests in 11.54 seconds, independent authentication/workspaces, disjoint 12+12 cursor pages, durable worker processing and logout revocation. All four issued test tokens were revoked. Support additionally verified persisted SSE, worker-created draft, saved edit, exact-version approval, idempotent replay and history.

The final server comparison found all 37 previously running unrelated containers unchanged by ID, start time and state; original nginx configuration hashes were unchanged. Free disk space was 9.21 GiB at that check. These are deployment observations, not ongoing capacity guarantees.

No paid model calls were made by this smoke. The earlier implementation record reports a separately authorized live adapter check; no live-provider retest is claimed for this structural release.

## Current refactor evidence

The current layout passed these local checks:

- `npm run lint`, `npm run typecheck` (seven workspaces plus mirrored tests) and `npm run format:check` passed.
- `npm test`: 13 unit tests passed.
- `TEST_DATABASE_URL=<disposable PostgreSQL> npm run test:db`: 19 PostgreSQL/API tests passed.
- `npm run build`: independent web, API and worker builds passed.
- `npm audit --omit=dev` reported zero known production dependency vulnerabilities at execution; this is not a general security certification.
- Generated OpenAPI 3.1.0 describes 17 production operations. Tests verified business bearer security, public documentation and local Swagger assets.
- Four connected browser tests passed: demo/paging/source/edit/approval/history/reload, independent accounts and auth races, mobile/offline/evidence gaps, and Swagger with zero external requests.
- Native local Compose rebuilt; migration exited 0, API/worker/web were healthy and the existing volume was preserved.

No live-provider call was rerun during this refactor. Routine verification remained deterministic.

## Remaining delivery work

1. Keep backend release automation separate from Vercel UI auto-deploy: the current backend rollout used guarded image updates; the repository release workflow packages an image artifact.
2. Configure encrypted off-host backups and verify an isolated restore before relying on retained account data.

Production Git delivery and `VITE_API_URL` cover `main` and the stable production alias. Feature previews require explicit environment/origin configuration. See [operations](operations.md) and [planning](../planning/README.md); earlier records remain in the [archive](archive/README.md).
