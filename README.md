# Support Desk

A support agent needs to answer a customer quickly without inventing a policy or overlooking what the customer already tried. Searching help articles and rewriting the same answer takes time; an unchecked AI draft can make the situation worse.

Support Desk turns a customer request into a **reviewed reply**: prepare a draft with OpenRouter, inspect the cited help articles, edit the wording and approve the exact saved version. If the knowledge base cannot answer the question, the draft asks for clarification. Approval records a response internally; it does not send an email.

[Try the demo](https://turovnd-support-desk.vercel.app) · [API documentation](https://turovnd-support-desk.vercel.app/docs) · [Project docs](docs/README.md)

## Try a complete workflow

1. Choose **Try the demo** to open your own workspace with 18 synthetic requests.
2. Open **My sign-in link expired before the meeting**. Notice that the customer has already retried and is concerned about losing their work.
3. Choose **Prepare reply**. Review the draft and open a citation to compare it with the current help article.
4. Edit and save the response, then **Review & approve**. The confirmation shows the exact text being approved.
5. Open **Resolved** or reload the ticket. The approved response and its history remain available.

For a different outcome, open a retention-policy question: the sample knowledge base contains no approved retention policy. The reply should acknowledge the gap rather than promise a retention period.

## Engineering decisions

- **Human approval is the write boundary.** Draft edits use optimistic version checks. Approval, history and optional internal escalation commit in one database transaction; an idempotency receipt makes a repeated approval safe.
- **The database owns job state.** Creation persists the request and job together. Vercel Queues wakes the worker; a scheduled scan recovers missed notifications and expired leases. Fences reject late worker writes. External model calls can still be billed more than once after a crash.
- **Grounding is inspectable.** PostgreSQL full-text search retrieves current synthetic articles. Model output is validated against a strict schema and exact source quotations. This verifies citations, not the truth of every generated sentence; a person still reviews the reply.
- **A small corpus does not need a vector database.** Retrieval is topic-guided because this MVP starts from seeded tickets. It is not a general help-desk ingestion or knowledge-management system.
- **Independent deployment.** React, Fastify and a private worker run as Vercel services with a separate Neon PostgreSQL database. Docker runs the same API and job processor locally. No dependency on Feedback Desk.

See [architecture](docs/architecture.md) for consistency boundaries and [limits](docs/limits.md) for the deliberate product limits.

## Run locally

Requires Node 24, npm and Docker Compose.

```sh
cp -n .env.example .env
# Replace POSTGRES_PASSWORD in .env with a URL-safe local password.
docker compose --profile local up --build --wait -d
```

Open `http://127.0.0.1:4173`. Local development defaults to an explicitly labelled sample provider so automated tests do not incur AI charges. To use real analysis, configure OpenRouter as described in [setup](docs/setup.md). There is no automatic fallback from OpenRouter to sample output.

```text
frontend/                  React pages, reusable components, API client and tests
backend/modules/api/       Fastify routes, schemas and HTTP concerns
backend/modules/worker/    Queue consumers and local worker loop
backend/common/            Contracts, data access, knowledge, configuration and queue transport
backend/migrations/        Ordered PostgreSQL migrations
backend/tests/             Tests mirroring backend ownership
```

[Planning: epics → stories → tasks](docs/planning/README.md) · [Testing](docs/testing.md) · [Deployment](docs/vercel.md)

Built independently with AI assistance and synthetic data. UI primitives come from shadcn/ui; attribution is in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
