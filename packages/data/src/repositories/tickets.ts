import { ticketSchema } from '@support-desk/contracts';
import { encodeCursor } from '../lib/cursor';
import type { SupportContext } from '../support-context';
export const createTicketsRepository = ({
  pool,
  core,
  getTicket,
  pageBounds,
}: SupportContext) => ({
  getTicket,
  tickets: async (
    workspace: string,
    status: 'all' | 'open' | 'resolved',
    limit: number,
    cursor?: string,
  ) => {
    const bounds = await pageBounds(
      workspace,
      `tickets:${status}`,
      cursor,
      'tickets',
    );
    const { rows } = await pool.query(
      `SELECT id,sequence::text,subject,customer,email,message,topic,status,created_at::text AS "createdAt" FROM tickets WHERE workspace_id=$1 AND ($2='all' OR status=$2) AND sequence<$3::bigint AND sequence<=$4::bigint ORDER BY tickets.sequence DESC LIMIT $5`,
      [workspace, status, bounds.after, bounds.ceiling, limit + 1],
    );
    const items = rows.slice(0, limit).map((row) => ticketSchema.parse(row));
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
  start: async (
    workspace: string,
    ticketId: string,
    provider: 'deterministic' | 'openrouter',
  ) => {
    const ticket = await getTicket(workspace, ticketId);
    return core.createRun(workspace, ticket.topic, ticket.id, provider);
  },
});
