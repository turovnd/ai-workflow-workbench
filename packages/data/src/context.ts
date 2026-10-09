import { runSchema, type Run } from '@support-desk/contracts';
import type { ReplyGenerator } from '@support-desk/knowledge';
import type { Pool, PoolClient } from 'pg';
import { NotFoundError } from './lib/errors';
export const createDataContext = (
  pool: Pool,
  generate?: ReplyGenerator,
  liveCallBudget = 0,
) => {
  const transaction = async <T>(
    operation: (client: PoolClient) => Promise<T>,
  ): Promise<T> => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };
  const append = async (
    client: PoolClient,
    runId: string,
    type: string,
    data: string,
  ) => {
    const { rows } = await client.query<{ cursor: number }>(
      'UPDATE runs SET cursor=cursor+1 WHERE id=$1 RETURNING cursor',
      [runId],
    );
    await client.query(
      'INSERT INTO events(run_id,seq,type,data) VALUES($1,$2,$3,$4)',
      [runId, rows[0].cursor, type, data],
    );
  };
  const getRun = async (workspaceId: string, id: string): Promise<Run> => {
    const { rows } = await pool.query(
      'SELECT id, case_id AS "caseId", status, brief, draft, cursor, created_at::text AS "createdAt", task_id AS "taskId",ticket_id AS "ticketId",provider FROM runs WHERE id=$1 AND workspace_id=$2',
      [id, workspaceId],
    );
    if (!rows[0]) throw new NotFoundError('Run not found.');
    return runSchema.parse(rows[0]);
  };
  return { pool, generate, liveCallBudget, transaction, append, getRun };
};
export type DataContext = ReturnType<typeof createDataContext>;
