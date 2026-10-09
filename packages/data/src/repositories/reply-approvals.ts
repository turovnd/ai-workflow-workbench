import { draftSchema } from '@support-desk/contracts';
import { randomUUID } from 'node:crypto';
import { ConflictError, NotFoundError } from '../lib/errors';
import { digestToken as hash } from '../lib/hash';
import type { SupportContext } from '../support-context';
export const createReplyApprovalsRepository = ({
  transaction,
}: SupportContext) => ({
  approveReply: async (
    workspace: string,
    runId: string,
    key: string,
    version: number,
    escalate: boolean,
  ) =>
    transaction(async (client) => {
      await client.query('SELECT id FROM workspaces WHERE id=$1 FOR UPDATE', [
        workspace,
      ]);
      const digest = hash(JSON.stringify([runId, version, escalate]));
      const previous = await client.query<{
        digest: string;
        reply_id: string;
        task_id: string | null;
      }>(
        'SELECT digest,reply_id,task_id FROM reply_receipts WHERE workspace_id=$1 AND key=$2',
        [workspace, key],
      );
      if (previous.rows[0]) {
        if (previous.rows[0].digest !== digest)
          throw new ConflictError(
            'Approval key already belongs to another decision.',
          );
        return {
          replyId: previous.rows[0].reply_id,
          taskId: previous.rows[0].task_id,
          replayed: true,
        };
      }
      const { rows } = await client.query<{
        ticket_id: string;
        status: string;
      }>(
        'SELECT ticket_id,status FROM runs WHERE id=$1 AND workspace_id=$2 FOR UPDATE',
        [runId, workspace],
      );
      if (!rows[0]) throw new NotFoundError('Run not found.');
      if (rows[0].status !== 'ready' || !rows[0].ticket_id)
        throw new ConflictError('The reply is not ready for approval.');
      const draftResult = await client.query(
        'SELECT text,version,edited FROM drafts WHERE run_id=$1 FOR UPDATE',
        [runId],
      );
      const draft = draftSchema.parse(draftResult.rows[0]);
      const saved = await client.query(
        'SELECT 1 FROM replies WHERE run_id=$1',
        [runId],
      );
      if (draft.version !== version || saved.rowCount)
        throw new ConflictError(
          'The draft changed or was already approved. Refresh before confirming.',
        );
      const replyId = randomUUID(),
        taskId = escalate ? randomUUID() : null;
      await client.query(
        'INSERT INTO replies(id,workspace_id,run_id,ticket_id,text,edited) VALUES($1,$2,$3,$4,$5,$6)',
        [
          replyId,
          workspace,
          runId,
          rows[0].ticket_id,
          draft.text,
          draft.edited,
        ],
      );
      if (taskId)
        await client.query(
          'INSERT INTO tasks(id,workspace_id,run_id,title,payload) VALUES($1,$2,$3,$4,$5)',
          [
            taskId,
            workspace,
            runId,
            'Internal support escalation',
            JSON.stringify({ ticketId: rows[0].ticket_id, replyId }),
          ],
        );
      await client.query(
        'INSERT INTO reply_receipts(workspace_id,key,digest,reply_id,task_id) VALUES($1,$2,$3,$4,$5)',
        [workspace, key, digest, replyId, taskId],
      );
      await client.query('UPDATE tickets SET status=$2 WHERE id=$1', [
        rows[0].ticket_id,
        escalate ? 'open' : 'resolved',
      ]);
      await client.query(
        'INSERT INTO history(id,workspace_id,ticket_id,run_id,kind,title,text,edited) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
        [
          randomUUID(),
          workspace,
          rows[0].ticket_id,
          runId,
          escalate ? 'escalation' : 'reply',
          escalate
            ? 'Reply saved with internal escalation'
            : 'Reply approved and saved',
          draft.text,
          draft.edited,
        ],
      );
      return { replyId, taskId, replayed: false };
    }),
});
