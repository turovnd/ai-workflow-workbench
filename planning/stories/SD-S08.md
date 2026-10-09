---
id: SD-S08
type: story
is_story_of: SD-E04
status: in-progress
---

# SD-S08: Independent hosted delivery and recovery

Parent: [SD-E04](../epics/SD-E04.md).

## User or maintainer outcome

Ship the UI/backend through verified delivery paths and retain recovery controls.

## Tasks

- [SD-T15: Isolated backend delivery](../tasks/SD-T15.md) — verified-hosted.
- [SD-T16: Vercel UI and exact API origin](../tasks/SD-T16.md) — verified-hosted.
- [SD-T17: Public Git and automatic delivery](../tasks/SD-T17.md) — verified-hosted.
- [SD-T18: Backup and restore rehearsal](../tasks/SD-T18.md) — backlog.

## Acceptance and evidence

All linked task criteria must be met, required tests executed, and current evidence recorded. This story remains open when a linked refactor/hosted check is pending, even if the deployed baseline already supports the user behavior. No dependency on the other portfolio repository is introduced.
