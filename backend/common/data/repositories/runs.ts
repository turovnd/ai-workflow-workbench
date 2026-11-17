import { eventSchema } from '@support-desk/contracts';
import { cases, corpusRevision } from '@support-desk/knowledge';
import { randomUUID } from 'node:crypto';
import type { DataContext } from '../context';
import { ConflictError, NotFoundError } from '../lib/errors';

export const createRunsRepository = ({
  pool,
  transaction,
  getRun,
  append,
}: DataContext) => ({
  getRun,
  createRun: async (
    workspaceId: string,
    caseId: string,
    ticketId: string | null = null,
    provider: 'deterministic' | 'openrouter' = 'deterministic',
  ) =>
    transaction(async (client) => {
      if (!cases.some((item) => item.id === caseId))
        throw new NotFoundError('Case not found.');
      await client.query('SELECT id FROM workspaces WHERE id=$1 FOR UPDATE', [
        workspaceId,
      ]);
      const active = await client.query<{ count: string }>(
        "SELECT count(*) FROM runs WHERE workspace_id=$1 AND status IN ('queued','running')",
        [workspaceId],
      );
      if (Number(active.rows[0].count) >= 3)
        throw new ConflictError(
          'Three replies are being prepared. Wait for one to finish before starting another.',
        );
      const id = randomUUID();
      await client.query(
        `
          INSERT INTO
            runs (
              id,
              workspace_id,
              case_id,
              status,
              corpus_revision,
              ticket_id,
              provider
            )
          VALUES
            ($1, $2, $3, 'queued', $4, $5, $6)
        `,
        [id, workspaceId, caseId, corpusRevision, ticketId, provider],
      );
      await client.query('INSERT INTO jobs(run_id) VALUES($1)', [id]);
      await append(client, id, 'status', 'queued');
      if (ticketId)
        await client.query(
          'INSERT INTO history(id,workspace_id,ticket_id,run_id,kind,title,text) VALUES($1,$2,$3,$4,$5,$6,$7)',
          [
            randomUUID(),
            workspaceId,
            ticketId,
            id,
            'run',
            'Reply preparation requested',
            'A new grounded reply was requested.',
          ],
        );
      return id;
    }),
  events: async (workspaceId: string, runId: string, after: number) => {
    await getRun(workspaceId, runId);
    const { rows } = await pool.query(
      'SELECT seq,type,data FROM events WHERE run_id=$1 AND seq>$2 ORDER BY seq LIMIT 100',
      [runId, after],
    );
    return rows.map((row) => eventSchema.parse(row));
  },
  cancel: async (workspaceId: string, runId: string) =>
    transaction(async (client) => {
      const { rows } = await client.query(
        `
          UPDATE runs
          SET
            status = 'cancelled'
          WHERE
            id = $1
            AND workspace_id = $2
            AND status IN ('queued', 'running')
          RETURNING
            id
        `,
        [runId, workspaceId],
      );
      if (!rows[0])
        throw new ConflictError(
          'This run has already finished or cannot be cancelled.',
        );
      await client.query(
        "UPDATE jobs SET status='done',fence=fence+1,lease_until=NULL WHERE run_id=$1",
        [runId],
      );
      await append(client, runId, 'cancelled', 'Review cancelled.');
    }),
});
