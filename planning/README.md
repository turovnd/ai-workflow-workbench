# Support Desk current delivery plan

Current delivery plan for this independently runnable and releasable project.

## Status rules

- **verified-baseline**: the feature or deployed baseline has explicit prior execution evidence. A new release still requires its own deployment verification.
- **in-progress**: implementation or verification is currently underway.
- **pending**: authorized delivery work with acceptance not yet confirmed.
- **backlog**: an explicitly unfinished improvement, outside the already verified baseline.
- **verified-local**: the stated local checks passed for the current work; remote integration is a separate claim.

The [delivery ledger](../docs/delivery-status.md) owns externally confirmed status. Every task file contains `is_task_of`, explicit dependencies, goal, scope, acceptance, tests and implementation evidence. Dependencies express the order for the current delivery.

## Epic and story index

| Epic                                                  | Stories                                                  | Outcome                                                                    |
| ----------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| [SD-E01 — Foundation and contracts](epics/SD-E01.md)  | [SD-S01](stories/SD-S01.md), [SD-S02](stories/SD-S02.md) | Explicit source boundaries, mirrored tests and inspectable HTTP contracts. |
| [SD-E02 — Identity and browsing](epics/SD-E02.md)     | [SD-S03](stories/SD-S03.md), [SD-S04](stories/SD-S04.md) | Independent accounts, private client state and stable paged review.        |
| [SD-E03 — Durable product workflow](epics/SD-E03.md)  | [SD-S05](stories/SD-S05.md), [SD-S06](stories/SD-S06.md) | Source-backed generation, persistence and recoverable effects.             |
| [SD-E04 — Verification and delivery](epics/SD-E04.md) | [SD-S07](stories/SD-S07.md), [SD-S08](stories/SD-S08.md) | Local/hosted evidence, public Git delivery and operational recovery.       |

## Task index

| Task                                                            | Story                       | Status            | Goal                                                                                      |
| --------------------------------------------------------------- | --------------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| [SD-T01 — Runtime boundaries](tasks/SD-T01.md)                  | [SD-S01](stories/SD-S01.md) | verified-local    | Make module ownership explicit without changing the product contract.                     |
| [SD-T02 — One mirrored test tree](tasks/SD-T02.md)              | [SD-S01](stories/SD-S01.md) | verified-local    | Give every test a discoverable production owner.                                          |
| [SD-T03 — Generated API contract and Swagger](tasks/SD-T03.md)  | [SD-S02](stories/SD-S02.md) | verified-local    | Let a reviewer inspect and exercise the real API contract.                                |
| [SD-T04 — Account and demo sessions](tasks/SD-T04.md)           | [SD-S03](stories/SD-S03.md) | verified-local    | Establish server-owned identity for every support action.                                 |
| [SD-T05 — Guarded auth and session UI](tasks/SD-T05.md)         | [SD-S03](stories/SD-S03.md) | verified-local    | Keep private UI data attached to the active identity.                                     |
| [SD-T06 — Ticket and history cursor paging](tasks/SD-T06.md)    | [SD-S04](stories/SD-S04.md) | verified-local    | Browse bounded history and inbox pages without overlap or scope leaks.                    |
| [SD-T07 — Inbox and source review interface](tasks/SD-T07.md)   | [SD-S04](stories/SD-S04.md) | verified-local    | Let a reviewer find a ticket and inspect evidence without losing navigation state.        |
| [SD-T08 — Current knowledge and provenance](tasks/SD-T08.md)    | [SD-S05](stories/SD-S05.md) | verified-local    | Ground preparation in current synthetic help content.                                     |
| [SD-T09 — Bounded optional model adapter](tasks/SD-T09.md)      | [SD-S05](stories/SD-S05.md) | verified-local    | Offer opt-in generation without unbounded calls or unsupported output.                    |
| [SD-T10 — Durable reply jobs and cancellation](tasks/SD-T10.md) | [SD-S06](stories/SD-S06.md) | verified-local    | Resume committed reply work safely after crashes.                                         |
| [SD-T11 — Versioned draft edit and approval](tasks/SD-T11.md)   | [SD-S06](stories/SD-S06.md) | verified-local    | Persist exactly the reply version the reviewer approved.                                  |
| [SD-T12 — Persisted progress and recovery UI](tasks/SD-T12.md)  | [SD-S06](stories/SD-S06.md) | verified-local    | Show honest preparation progress and recover after connection loss.                       |
| [SD-T13 — Regression and release evidence](tasks/SD-T13.md)     | [SD-S07](stories/SD-S07.md) | verified-local    | Prove the reorganized application still works as a complete system.                       |
| [SD-T14 — Current docs and traceable plan](tasks/SD-T14.md)     | [SD-S07](stories/SD-S07.md) | verified-local    | Make the project understandable without mixing earlier proposals with delivered behavior. |
| [SD-T15 — Isolated backend delivery](tasks/SD-T15.md)           | [SD-S08](stories/SD-S08.md) | verified-baseline | Run this API, worker and database without disturbing unrelated server services.           |
| [SD-T16 — Vercel UI and exact API origin](tasks/SD-T16.md)      | [SD-S08](stories/SD-S08.md) | pending           | Make the published frontend usable against its real independent API.                      |
| [SD-T17 — Public Git and automatic delivery](tasks/SD-T17.md)   | [SD-S08](stories/SD-S08.md) | in-progress       | Turn the reviewed public repository into a reproducible delivery source.                  |
| [SD-T18 — Backup and restore rehearsal](tasks/SD-T18.md)        | [SD-S08](stories/SD-S08.md) | backlog           | Recover retained account data independently of the running volume.                        |

## Delivery order and completion rule

Source/test boundaries, API documentation and local regression are verified. Remaining delivery work is the new public UI/API release, first hosted CI/push-triggered production deployment and off-host recovery rehearsal. Production Git delivery tracks `main`; feature previews need their own explicit environment/origin configuration.

An epic is complete only when its stories' acceptance is satisfied at the stated scope. Source existence, a static URL returning 200 or a workflow YAML file alone does not establish that outcome. Update the task evidence and [delivery ledger](../docs/delivery-status.md) together when verification changes.
