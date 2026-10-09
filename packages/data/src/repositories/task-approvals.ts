import type { Brief } from '@support-desk/contracts';
import { randomUUID } from 'node:crypto';
import type { DataContext } from '../context';
import { ConflictError, NotFoundError } from '../lib/errors';
import { digestToken } from '../lib/hash';
export const createTaskApprovalsRepository = ({
  transaction,
  append,
}: DataContext) => ({
  approve: async (
    workspaceId: string,
    runId: string,
    key: string,
    version: number,
  ) =>
    transaction(async (client) => {
      const digest = digestToken(JSON.stringify([runId, version]));
      await client.query('SELECT id FROM workspaces WHERE id=$1 FOR UPDATE', [
        workspaceId,
      ]);
      const replay = await client.query<{ digest: string; task_id: string }>(
        'SELECT digest,task_id FROM approvals WHERE workspace_id=$1 AND key=$2',
        [workspaceId, key],
      );
      if (replay.rows[0]) {
        if (replay.rows[0].digest !== digest)
          throw new ConflictError(
            'This idempotency key belongs to a different approval.',
          );
        return { taskId: replay.rows[0].task_id, replayed: true };
      }
      const { rows } = await client.query(
        'SELECT brief,status,task_id FROM runs WHERE id=$1 AND workspace_id=$2 FOR UPDATE',
        [runId, workspaceId],
      );
      if (!rows[0]) throw new NotFoundError('Run not found.');
      const run = rows[0] as {
        brief: Brief | null;
        status: string;
        task_id: string | null;
      };
      if (
        run.status !== 'ready' ||
        !run.brief?.proposal ||
        run.brief.proposal.version !== version ||
        run.task_id
      )
        throw new ConflictError(
          'The proposal changed or was already approved. Refresh and review its current state.',
        );
      const taskId = randomUUID();
      await client.query(
        'INSERT INTO tasks(id,workspace_id,run_id,title,payload) VALUES($1,$2,$3,$4,$5)',
        [
          taskId,
          workspaceId,
          runId,
          run.brief.proposal.title,
          JSON.stringify(run.brief.proposal),
        ],
      );
      await client.query(
        'INSERT INTO approvals(workspace_id,key,digest,task_id) VALUES($1,$2,$3,$4)',
        [workspaceId, key, digest, taskId],
      );
      await client.query('UPDATE runs SET task_id=$2 WHERE id=$1', [
        runId,
        taskId,
      ]);
      await append(client, runId, 'status', 'approved');
      return { taskId, replayed: false };
    }),
});
