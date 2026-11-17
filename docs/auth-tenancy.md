# Identity and workspace ownership

Try the demo creates an isolated workspace with synthetic requests. Register creates a persistent account and its own workspace; sign-in restores it. Passwords are hashed with scrypt and sessions use random opaque tokens stored hashed in PostgreSQL. Browser tokens live in session storage.

Sessions last 24 hours. A new sign-in replaces the account's prior session; sign-out revokes it. Demo workspaces are eligible for retention cleanup, while registered accounts are preserved. The demo has no email verification, password recovery, team invitations or role-management UI.

Every ticket, run, draft, history item and approval is scoped to the authenticated workspace. Signed cursors cannot be reused across workspaces or filters. The browser cancels requests and clears its query cache on session changes; a late response from an old session is rejected by the transport.

The single account acts as reviewer. Adding teams would require membership checks and permissions at the application-operation boundary, not just hiding buttons.
