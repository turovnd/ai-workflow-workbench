# Product overview

Support Desk helps a reviewer answer synthetic support tickets using current, versioned help articles. The useful output is a saved, reviewed response and optional internal escalation; no email or external task is sent.

A reviewer creates a local account or opens an isolated demo, browses the inbox, prepares a reply, inspects exact cited text and article revision, edits the saved draft, then approves the exact reviewed version. Approval persists history and resolves the ticket. Unsupported policy questions request clarification instead of inventing a retention guarantee.

The implementation uses real PostgreSQL retrieval and durable jobs even in deterministic mode. Lexical full-text retrieval includes current document revisions. Optional OpenRouter generation uses the same source-validation boundary; it does not introduce embeddings or semantic search. The UI reports generation mode and actual preparation progress, not simulated token streaming.

The accepted UI preset is [shadcn b1Ymqvgiu](https://ui.shadcn.com/create?preset=b1Ymqvgiu): Nova, Neutral, Blue/chartBlue, Inter for body/headings and Lucide icons. A small inbox, focused ticket workspace, source dialog and versioned review flow are the product surface.

See [workflows](workflows.md) for state transitions, [limits](limits.md) for bounded demo scope and [delivery status](delivery-status.md) for verified availability.
