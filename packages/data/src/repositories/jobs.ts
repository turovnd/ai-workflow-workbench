import type { Brief } from '@support-desk/contracts';
import type { DataContext } from '../context';
export const createJobsRepository = ({
  pool,
  transaction,
  append,
}: DataContext) => ({
  claim: async () =>
    transaction(async (client) => {
      // Every path locks the run before its job; SKIP LOCKED avoids waiting on cancellation.
      const exhausted = await client.query<{ run_id: string }>(
        "SELECT r.id AS run_id FROM runs r JOIN jobs j ON j.run_id=r.id WHERE j.attempts>=3 AND (j.status='queued' OR (j.status='leased' AND j.lease_until<now())) AND r.status IN ('queued','running') ORDER BY r.id FOR UPDATE OF r SKIP LOCKED LIMIT 100",
      );
      for (const row of exhausted.rows) {
        await client.query("UPDATE jobs SET status='failed' WHERE run_id=$1", [
          row.run_id,
        ]);
        await client.query("UPDATE runs SET status='failed' WHERE id=$1", [
          row.run_id,
        ]);
        await append(
          client,
          row.run_id,
          'failed',
          'The worker exhausted three attempts. Start a new review.',
        );
      }
      const { rows } = await client.query<{ run_id: string; fence: number }>(
        "WITH candidate AS (SELECT r.id FROM runs r JOIN jobs j ON j.run_id=r.id WHERE r.status IN ('queued','running') AND j.attempts<3 AND ((j.status='queued' AND j.available_at<=now()) OR (j.status='leased' AND j.lease_until<now())) ORDER BY j.available_at,r.id FOR UPDATE OF r SKIP LOCKED LIMIT 1) UPDATE jobs SET status='leased',fence=fence+1,attempts=attempts+1,lease_until=now()+interval '90 seconds' FROM candidate WHERE jobs.run_id=candidate.id RETURNING jobs.run_id,jobs.fence",
      );
      const job = rows[0];
      if (job) {
        await client.query("UPDATE runs SET status='running' WHERE id=$1", [
          job.run_id,
        ]);
        await append(client, job.run_id, 'status', 'retrieving');
      }
      return job ?? null;
    }),
  complete: async (runId: string, fence: number, brief: Brief) =>
    transaction(async (client) => {
      await client.query('SELECT id FROM runs WHERE id=$1 FOR UPDATE', [runId]);
      const { rows } = await client.query(
        "SELECT j.run_id FROM jobs j JOIN runs r ON r.id=j.run_id WHERE j.run_id=$1 AND j.fence=$2 AND j.status='leased' AND j.lease_until>now() AND r.status IN ('queued','running') FOR UPDATE OF j",
        [runId, fence],
      );
      if (!rows[0]) return false;
      await append(client, runId, 'status', 'generating');
      await append(client, runId, 'draft', brief.reply);
      await client.query(
        "UPDATE runs SET status='ready',brief=$2,draft=$3 WHERE id=$1",
        [runId, JSON.stringify(brief), brief.reply],
      );
      await client.query(
        'INSERT INTO drafts(run_id,text) VALUES($1,$2) ON CONFLICT(run_id) DO UPDATE SET text=excluded.text',
        [runId, brief.reply],
      );
      await append(
        client,
        runId,
        'ready',
        'Review the evidence before approving.',
      );
      await client.query(
        "UPDATE jobs SET status='done',lease_until=NULL WHERE run_id=$1",
        [runId],
      );
      return true;
    }),
  fail: async (runId: string, fence: number, message: string) =>
    transaction(async (client) => {
      await client.query('SELECT id FROM runs WHERE id=$1 FOR UPDATE', [runId]);
      const result = await client.query(
        "UPDATE jobs SET status='failed',lease_until=NULL WHERE run_id=$1 AND fence=$2 AND status='leased' RETURNING run_id",
        [runId, fence],
      );
      if (!result.rowCount) return;
      await client.query("UPDATE runs SET status='failed' WHERE id=$1", [
        runId,
      ]);
      await append(client, runId, 'failed', message);
    }),
  retry: async (runId: string, fence: number) => {
    await pool.query(
      "UPDATE jobs SET status='queued',available_at=now()+interval '2 seconds',lease_until=NULL WHERE run_id=$1 AND fence=$2 AND status='leased'",
      [runId, fence],
    );
  },
});
