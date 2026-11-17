# Support Desk MVP plan

The MVP takes a synthetic customer request through AI-assisted drafting, source review and explicit approval. It does not include outbound delivery, ingestion or team administration.

Epics and stories describe intended outcomes and acceptance. Task files contain implementation evidence and verification status; no product versions or release archives are maintained.

| Epic                                                              | Stories                                                  | Outcome                                                                                                    |
| ----------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [SD-E01 — Understand and own customer requests](epics/SD-E01.md)  | [SD-S01](stories/SD-S01.md), [SD-S02](stories/SD-S02.md) | A reviewer can enter a private workspace, find a request and return to it by URL.                          |
| [SD-E02 — Produce a reviewed, grounded response](epics/SD-E02.md) | [SD-S03](stories/SD-S03.md), [SD-S04](stories/SD-S04.md) | A reviewer can use AI without surrendering control of the final response.                                  |
| [SD-E03 — Keep the workflow dependable](epics/SD-E03.md)          | [SD-S05](stories/SD-S05.md), [SD-S06](stories/SD-S06.md) | Accepted work survives transient failures and the application can be independently deployed and inspected. |

## Tasks

| Task                      | Story                       | Scope                                         |
| ------------------------- | --------------------------- | --------------------------------------------- |
| [SD-T01](tasks/SD-T01.md) | [SD-S01](stories/SD-S01.md) | Account and demo sessions                     |
| [SD-T02](tasks/SD-T02.md) | [SD-S02](stories/SD-S02.md) | Routed inbox and request pages                |
| [SD-T03](tasks/SD-T03.md) | [SD-S02](stories/SD-S02.md) | Cursor pagination                             |
| [SD-T04](tasks/SD-T04.md) | [SD-S03](stories/SD-S03.md) | Current evidence and realistic requests       |
| [SD-T05](tasks/SD-T05.md) | [SD-S03](stories/SD-S03.md) | Real OpenRouter generation                    |
| [SD-T06](tasks/SD-T06.md) | [SD-S04](stories/SD-S04.md) | Edit and approve a saved reply                |
| [SD-T07](tasks/SD-T07.md) | [SD-S05](stories/SD-S05.md) | Durable jobs and queue recovery               |
| [SD-T08](tasks/SD-T08.md) | [SD-S05](stories/SD-S05.md) | Visible progress and history                  |
| [SD-T09](tasks/SD-T09.md) | [SD-S06](stories/SD-S06.md) | Structure, migrations and generated contracts |
| [SD-T10](tasks/SD-T10.md) | [SD-S06](stories/SD-S06.md) | Independent deployment and verification       |
