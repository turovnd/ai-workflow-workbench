import { randomBytes, randomUUID } from 'node:crypto';
import type { DataContext } from '../context';
import { ConflictError } from '../lib/errors';
import { digestToken } from '../lib/hash';

export const createLifecycleRepository = ({
  pool,
  transaction,
}: DataContext) => ({
  health: async () => {
    await pool.query('SELECT 1');
  },
  cleanup: async () =>
    transaction(async (client) => {
      const { rows } = await client.query<{ id: string }>(
        "SELECT id FROM workspaces WHERE demo AND created_at<now()-interval '24 hours' LIMIT 100 FOR UPDATE SKIP LOCKED",
      );
      const ids = rows.map((row) => row.id);
      if (!ids.length) return;
      for (const table of ['reply_receipts', 'history', 'replies'])
        await client.query(
          `DELETE FROM ${table} WHERE workspace_id=ANY($1::uuid[])`,
          [ids],
        );
      await client.query(
        'DELETE FROM approvals WHERE workspace_id=ANY($1::uuid[])',
        [ids],
      );
      await client.query(
        'DELETE FROM tasks WHERE workspace_id=ANY($1::uuid[])',
        [ids],
      );
      await client.query(
        'DELETE FROM runs WHERE workspace_id=ANY($1::uuid[])',
        [ids],
      );
      await client.query(
        'DELETE FROM tickets WHERE workspace_id=ANY($1::uuid[])',
        [ids],
      );
      await client.query('DELETE FROM workspaces WHERE id=ANY($1::uuid[])', [
        ids,
      ]);
    }),
  createSession: async () =>
    transaction(async (client) => {
      await client.query('SELECT pg_advisory_xact_lock(428014)');
      const count = await client.query<{ count: string }>(
        'SELECT count(*) FROM workspaces',
      );
      if (Number(count.rows[0].count) >= 1000)
        throw new ConflictError(
          'The demo is at capacity. Please try again later.',
        );
      const token = randomBytes(32).toString('base64url');
      const id = randomUUID();
      await client.query(
        'INSERT INTO workspaces(id,token_hash) VALUES($1,$2)',
        [id, digestToken(token)],
      );
      return { token, workspaceId: id };
    }),
  authenticate: async (token: string) => {
    const { rows } = await pool.query<{ id: string }>(
      "SELECT id FROM workspaces WHERE token_hash=$1 AND created_at > now() - interval '24 hours'",
      [digestToken(token)],
    );
    return rows[0]?.id;
  },
});
