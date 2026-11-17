# MVP boundaries

Support Desk demonstrates one workflow: a person reviews and approves an AI-assisted reply to a synthetic customer request.

- Requests and help articles are seeded; there is no email ingestion, CRM connector or knowledge editor.
- Approval records a response internally. It does not deliver email or create a task in another service.
- Accounts own one workspace. Teams, invitations, roles, password recovery and email verification are outside this MVP.
- Retrieval uses the known ticket topic and PostgreSQL full-text search over a small corpus. It does not evaluate arbitrary documents or guarantee factual correctness.
- Exact quote validation checks that cited words exist in a current source. It cannot prove that the model interpreted those words correctly.
- A workspace can prepare three replies concurrently. Each preparation has at most three claimed attempts, a 45-second provider timeout and 1,200 output tokens per attempt. A lifetime AI-call cap is optional and disabled with `LIVE_CALL_BUDGET=-1`.
- HTTP requests, page sizes and output bodies are bounded. Per-instance rate limits reduce accidental bursts; they are not a distributed abuse-control system.
- Queue delivery and provider calls are at least once. Database fencing prevents a late completion from replacing a newer result; duplicate model billing after a crash remains possible.

These boundaries are deliberate. Adding ingestion, team authorization or outbound delivery would require new product decisions and failure semantics.
