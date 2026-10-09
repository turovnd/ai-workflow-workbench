# Limits and unsupported guarantees

These are code/configuration bounds from the implemented baseline, not measured capacity. Recheck them when changing admission or provider code.

| Boundary                | Implemented baseline                                           |
| ----------------------- | -------------------------------------------------------------- |
| Request body            | 32 KiB API/proxy limit.                                        |
| Saved draft             | 6,000 characters, with UTF-8 boundary coverage.                |
| Seeded inbox            | 36 synthetic tickets/workspace.                                |
| Workspace admission     | 1,000 workspaces; bounded cleanup.                             |
| Run admission           | 20 runs/workspace; at most three live replies/workspace.       |
| Sessions/demo retention | 24 hours; registered data excluded from demo cleanup.          |
| Cursor page             | 1–50 items; signed workspace/filter/ticket scope.              |
| Worker                  | 90-second lease; at most three deliveries.                     |
| SSE connection          | At most 90 seconds; replay and final snapshot available.       |
| OpenRouter              | 45-second timeout; 1,200 output tokens; 32 KiB response bound. |
| Global provider budget  | Persisted attempt reservations; default 2, configurable 0–10.  |

Exact-origin CORS, route/IP admission, bounded hashing, Docker CPU/memory/log limits and private database networking are additional defenses. These limits do not replace authorization or backups.

Not implemented: arbitrary uploads, embeddings/pgvector, semantic retrieval, true token streaming, outbound email, external issue creation, offline approval, OAuth, email verification/reset, organizations/roles, production quality scores or high availability. Lexical retrieval and exact quotes preserve provenance; they do not prove every edited or generated statement true. Fenced/idempotent stored effects do not guarantee exactly-once provider execution or billing.
