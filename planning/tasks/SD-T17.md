---
id: SD-T17
type: task
is_task_of: SD-S08
status: verified-hosted
depends_on: ['SD-T13', 'SD-T14', 'SD-T16']
---

# SD-T17: Public Git and automatic delivery

Parent story: [SD-S08](../stories/SD-S08.md).

## Goal

Turn the reviewed public repository into a reproducible delivery source.

## Scope

Create/push the explicitly authorized turovnd repository, connect the correct Vercel project, configure CI and verify push-triggered UI delivery. Track backend automation separately.

## Dependencies

- [SD-T13](../tasks/SD-T13.md)
- [SD-T14](../tasks/SD-T14.md)
- [SD-T16](../tasks/SD-T16.md)

## Acceptance criteria

- [x] Public source contains no secrets/private inputs and uses the intended remote.
- [x] A real hosted CI run passes for the published revision.
- [x] A push triggers the intended Vercel deployment; backend release automation reports its own tested status.

## Tests and verification

- Secret/source allowlist review, remote identity verification, hosted CI run and deployment revision comparison.
- Verify follow-up commits independently through the configured delivery path.

## Status

**verified-hosted**.

## Implementation evidence

Public source is published to the intended repository. Git `main` commit [5f9228975d9e](https://github.com/turovnd/ai-workflow-workbench/commit/5f9228975d9e77939842ab65a3a6aee395fbe2c7) automatically produced READY production deployment `dpl_ARdtDjWoheTQAXkoiQvszfVRbM3v`. [GitHub CI run 38000404242](https://github.com/turovnd/ai-workflow-workbench/actions/runs/38000404242) succeeded for that exact source revision, including the `verify` job’s static, unit, PostgreSQL, build, container and browser checks. Backend image rollout was verified separately; the release workflow packages an artifact and does not yet establish automatic server deployment.

Implementation and verification locations:

- [.github/workflows/ci.yml](../../.github/workflows/ci.yml)
- [.github/workflows/release.yml](../../.github/workflows/release.yml)
- [vercel.json](../../vercel.json)
- [docs/delivery-status.md](../../docs/delivery-status.md)
