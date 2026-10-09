import { documents } from '@support-desk/knowledge';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
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
  migrate: async () => {
    await pool.query(
      await readFile(
        process.env.MIGRATIONS_DIR
          ? resolve(process.env.MIGRATIONS_DIR, '001_initial.sql')
          : new URL('../../migrations/001_initial.sql', import.meta.url),
        'utf8',
      ),
    );
    await pool.query(
      await readFile(
        process.env.MIGRATIONS_DIR
          ? resolve(process.env.MIGRATIONS_DIR, '002_support.sql')
          : new URL('../../migrations/002_support.sql', import.meta.url),
        'utf8',
      ),
    );
    await pool.query(
      'UPDATE evidence SET current=false WHERE NOT(id=ANY($1::text[]))',
      [documents.map((doc) => doc.id)],
    );
    for (const doc of documents)
      await pool.query(
        'INSERT INTO evidence(id,title,revision,section,current,text,keywords) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET title=excluded.title, revision=excluded.revision, section=excluded.section,current=excluded.current,text=excluded.text,keywords=excluded.keywords',
        [
          doc.id,
          doc.title,
          doc.revision,
          doc.section,
          doc.current,
          doc.text,
          doc.keywords,
        ],
      );
  },
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
