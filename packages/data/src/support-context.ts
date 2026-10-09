import { ticketSchema } from '@support-desk/contracts';
import { syntheticNames, ticketTemplates } from '@support-desk/knowledge';
import { randomBytes, randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { decodeCursor } from './lib/cursor';
import { ConflictError, NotFoundError } from './lib/errors';
import { digestToken as hash } from './lib/hash';
import type { Repository } from './repository';
export const createSupportContext = (pool: Pool, core: Repository) => {
  const transaction = async <T>(
    fn: (client: PoolClient) => Promise<T>,
  ): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const value = await fn(client);
      await client.query('COMMIT');
      return value;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };
  const seed = async (client: PoolClient, workspace: string) => {
    for (let index = 0; index < 36; index++) {
      const template = ticketTemplates[(35 - index) % 3];
      const customer = syntheticNames[index % syntheticNames.length];
      await client.query(
        'INSERT INTO tickets(id,workspace_id,subject,customer,email,message,topic) VALUES($1,$2,$3,$4,$5,$6,$7)',
        [
          randomUUID(),
          workspace,
          template.subject,
          customer,
          `customer-${index + 1}@example.test`,
          template.message,
          template.topic,
        ],
      );
    }
  };
  const session = async (
    client: PoolClient,
    workspaceId: string,
    email: string | null,
    demo: boolean,
  ) => {
    const token = randomBytes(32).toString('base64url');
    await client.query('DELETE FROM sessions WHERE workspace_id=$1', [
      workspaceId,
    ]);
    await client.query(
      'INSERT INTO sessions(token_hash,workspace_id) VALUES($1,$2)',
      [hash(token), workspaceId],
    );
    return { token, workspaceId, email, demo };
  };
  const createWorkspace = async (client: PoolClient, demo: boolean) => {
    await client.query('SELECT pg_advisory_xact_lock(428014)');
    const count = await client.query<{ count: string }>(
      'SELECT count(*) FROM workspaces',
    );
    if (Number(count.rows[0].count) >= 1000)
      throw new ConflictError(
        'The demo is at capacity. Please try again later.',
      );
    const id = randomUUID();
    await client.query(
      'INSERT INTO workspaces(id,token_hash,demo) VALUES($1,$2,$3)',
      [id, randomBytes(32).toString('hex'), demo],
    );
    await seed(client, id);
    return id;
  };
  const getTicket = async (workspace: string, id: string) => {
    const { rows } = await pool.query(
      'SELECT id,sequence::text,subject,customer,email,message,topic,status,created_at::text AS "createdAt" FROM tickets WHERE id=$1 AND workspace_id=$2',
      [id, workspace],
    );
    if (!rows[0]) throw new NotFoundError('Ticket not found.');
    return ticketSchema.parse(rows[0]);
  };
  const pageBounds = async (
    workspace: string,
    scope: string,
    cursor: string | undefined,
    table: 'tickets' | 'history',
  ) => {
    const { rows } = await pool.query<{ token_hash: string }>(
      'SELECT token_hash FROM workspaces WHERE id=$1',
      [workspace],
    );
    if (!rows[0]) throw new NotFoundError('Workspace not found.');
    const secret = rows[0].token_hash;
    if (cursor)
      return { ...decodeCursor(cursor, secret, workspace, scope), secret };
    const max = await pool.query<{ ceiling: string }>(
      `SELECT COALESCE(max(sequence),0)::text AS ceiling FROM ${table} WHERE workspace_id=$1`,
      [workspace],
    );
    return {
      v: 1 as const,
      scope,
      workspace,
      after: (BigInt(max.rows[0].ceiling) + 1n).toString(),
      ceiling: max.rows[0].ceiling,
      secret,
    };
  };
  return {
    pool,
    core,
    transaction,
    session,
    createWorkspace,
    getTicket,
    pageBounds,
  };
};
export type SupportContext = ReturnType<typeof createSupportContext>;
