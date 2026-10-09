import {
  approvalSchema,
  draftSchema,
  historyPageSchema,
  replyReceiptSchema,
  runSchema,
  sessionSchema,
  ticketPageSchema,
  ticketSchema,
} from '@support-desk/contracts';
import { z } from 'zod';
const json = (schema: z.ZodType) => {
  const result = z.toJSONSchema(schema, { target: 'draft-07', io: 'output' });
  delete result.$schema;
  return result;
};
export const responseSchemas = {
  session: json(sessionSchema),
  identity: json(sessionSchema.omit({ token: true })),
  ticket: json(ticketSchema),
  tickets: json(ticketPageSchema),
  history: json(historyPageSchema),
  draft: json(draftSchema),
  receipt: json(replyReceiptSchema),
  run: json(runSchema),
  approval: json(approvalSchema),
  legacySession: json(sessionSchema.pick({ token: true, workspaceId: true })),
  health: json(
    z.object({
      status: z.literal('ok'),
      mode: z.enum(['deterministic', 'openrouter']),
    }),
  ),
  capabilities: json(
    z.object({ generationMode: z.enum(['deterministic', 'openrouter']) }),
  ),
  logout: json(z.object({ ok: z.literal(true) })),
  cancel: json(z.object({ status: z.literal('cancelled') })),
};
export const errorResponses = Object.fromEntries(
  Object.entries({
    400: 'Invalid body, parameters or cursor; restart pagination without a cursor.',
    401: 'Missing, invalid, expired or revoked session.',
    404: 'Resource missing or belongs to another workspace.',
    409: 'Stale version, conflicting idempotency key or capacity limit.',
    413: 'Request exceeds the 32 KiB UTF-8 body limit.',
    429: 'Rate limit exceeded; wait before retrying.',
    500: 'Unexpected service error; no successful effect is claimed.',
    503: 'Password hashing capacity is busy; retry after one second.',
  }).map(([status, description]) => [
    status,
    {
      type: 'object',
      additionalProperties: false,
      required: ['message'],
      properties: { message: { type: 'string' } },
      description,
    },
  ]),
);
export const eventResponse = {
  description:
    'Persisted progress events. Event IDs increase within a run; reconnect with after=<last ID>. The stream closes after terminal events or 90 seconds. Fetch GET /runs/{id} after EOF. Drafts become editable only after final evidence validation.',
  content: {
    'text/event-stream': {
      schema: {
        type: 'string',
        example: 'id: 1\ndata: {"seq":1,"type":"status","data":"queued"}\n\n',
      },
    },
  },
};
