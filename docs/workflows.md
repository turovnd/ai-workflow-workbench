# Workflows and consistency

## Reply preparation

1. Authenticate and read a workspace-scoped ticket.
2. Create the run and durable job in one transaction.
3. A separate worker claims a bounded lease/fence and retrieves current help-article revisions.
4. Deterministic or explicitly enabled provider generation produces a structured reply.
5. Validate shape, evidence membership and exact source quotes before saving an approvable draft.
6. Persist progress events and expose a final authoritative snapshot to the UI.

Runs move through queued/retrieving/generating/ready, with failed/cancelled terminal paths. Missing evidence yields a clarification-oriented result without a provider call or unsupported promise. The OpenRouter adapter returns strict structured JSON; the UI shows preparation progress then a complete validated reply. It does not claim token-by-token streaming.

## Edit and approve

A user edits a saved draft with an expected version. The UI identifies these edits as user edits rather than claiming model validation. Approval checks the exact saved version, records response/history and optional internal escalation, resolves the ticket and stores an idempotency receipt in one transaction. Same key/same intent replays; changed intent or a stale version conflicts. Reload and review the current version before trying a changed approval.

## Recovery and cancellation

Jobs use 90-second leases, fencing and at most three deliveries. A committed job survives API/worker failure. Provider work happens outside a transaction; completion is conditional on the current claim and uncancelled run. Cancellation invalidates a claimed worker; it does not undo a completed approval. A stale worker cannot overwrite the current result.

Per-run events are persisted before exposure. The SSE client deduplicates events, resumes with its cursor and retrieves the final snapshot. Connections are bounded; disconnect does not cancel a durable job. Network retries and worker recovery can repeat external work, so stored-effect idempotency is not exactly-once model billing.

## Inbox and history

Cursor pagination uses descending numeric sequence ordering, scoped authenticated cursors and a first-page insertion ceiling. It must remain correct across digit boundaries such as 9/10 and 99/100. Filter changes reset the client query; stale appended pages must not cross filters or sessions. Current status membership remains live, so refresh after resolving a ticket.

See [testing](testing.md) for evidence and [limits](limits.md) for admission/provider caps.
