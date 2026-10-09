import { historySchema } from '@support-desk/contracts';
import { encodeCursor } from '../lib/cursor';
import type { SupportContext } from '../support-context';
export const createHistoryRepository = ({
  pool,
  getTicket,
  pageBounds,
}: SupportContext) => ({
  history: async (
    workspace: string,
    ticketId: string,
    limit: number,
    cursor?: string,
  ) => {
    await getTicket(workspace, ticketId);
    const bounds = await pageBounds(
      workspace,
      `history:${ticketId}`,
      cursor,
      'history',
    );
    const { rows } = await pool.query(
      'SELECT id,sequence::text,kind,title,text,run_id AS "runId",edited,created_at::text AS "createdAt" FROM history WHERE workspace_id=$1 AND ticket_id=$2 AND sequence<$3::bigint AND sequence<=$4::bigint ORDER BY history.sequence DESC LIMIT $5',
      [workspace, ticketId, bounds.after, bounds.ceiling, limit + 1],
    );
    const items = rows.slice(0, limit).map((row) => historySchema.parse(row));
    const last = items.at(-1);
    return {
      items,
      nextCursor:
        rows.length > limit && last
          ? encodeCursor(
              {
                v: 1,
                workspace,
                scope: bounds.scope,
                ceiling: bounds.ceiling,
                after: last.sequence,
              },
              bounds.secret,
            )
          : null,
    };
  },
});
