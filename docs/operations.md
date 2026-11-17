# Operations

## Diagnose a preparation

Check `/health`, then inspect the run and its persisted events in Swagger using the affected workspace session. A run progresses from queued to running to ready, failed or cancelled. Worker logs contain event names and run IDs, not customer text, prompts, keys or provider response bodies.

A queued run is durable even if queue publishing failed. The scheduled recovery consumer republishes eligible jobs. A crashed worker's lease expires after 90 seconds. A valid worker must present its current fence to commit. Three exhausted attempts become a visible failure; the user may request another preparation.

Network failures, 429 and provider 5xx responses are retried. Authentication/configuration errors and invalid model output fail visibly. Fix credentials/configuration before retrying; there is no sample-output fallback.

## Database changes and recovery

Apply migrations explicitly before deployment through a direct database connection. node-pg-migrate records applied migrations and serializes migration execution. Reapplying an unchanged migration set is a no-op; current synthetic help articles are refreshed idempotently afterward.

For backups, use `pg_dump --format=custom` with a privately supplied connection URL. Store the encrypted export outside the application host with restricted access. Restore with `pg_restore --no-owner --no-acl` into a new isolated database, apply pending migrations, compare table counts and run the synthetic prepare/approve/reload flow before changing the runtime connection.

A backup file alone is not a verified restore. Neon branch history and recovery windows depend on the configured plan; check them in the database console before relying on them. Never test restore by overwriting the active database.

## Local operations

`docker compose --profile local logs api worker migrate` shows this application's logs. `docker compose --profile local down` stops only this Compose project and retains its data. Do not remove volumes or change another application's proxy or ports during maintenance.
