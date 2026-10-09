import { draftSchema } from '@support-desk/contracts';
import { ConflictError, NotFoundError } from '../lib/errors';
import type { SupportContext } from '../support-context';
export const createDraftsRepository = ({
  pool,
  core,
  transaction,
}: SupportContext) => ({
  draft: async (workspace: string, runId: string) => {
    await core.getRun(workspace, runId);
    const { rows } = await pool.query(
      'SELECT text,version,edited,EXISTS(SELECT 1 FROM replies WHERE run_id=$1) AS approved FROM drafts WHERE run_id=$1',
      [runId],
    );
    if (!rows[0]) throw new NotFoundError('Draft is not ready.');
    return draftSchema.parse(rows[0]);
  },
  edit: async (
    workspace: string,
    runId: string,
    text: string,
    version: number,
  ) =>
    transaction(async (client) => {
      const run = await client.query(
        'SELECT id FROM runs WHERE id=$1 AND workspace_id=$2 FOR UPDATE',
        [runId, workspace],
      );
      if (!run.rows[0]) throw new NotFoundError('Run not found.');
      const { rows } = await client.query(
        'UPDATE drafts SET text=$2,version=version+1,edited=true WHERE run_id=$1 AND version=$3 AND NOT EXISTS(SELECT 1 FROM replies WHERE run_id=$1) RETURNING text,version,edited',
        [runId, text, version],
      );
      if (!rows[0])
        throw new ConflictError(
          'The draft changed or was already approved. Reload the saved draft.',
        );
      return draftSchema.parse(rows[0]);
    }),
});
