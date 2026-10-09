import type { SupportRepository } from '@support-desk/data';
import type { FastifyInstance } from 'fastify';
import { params } from '../schemas/support';
export const registerDraftRoutes = (
  routes: FastifyInstance,
  support: SupportRepository,
) => {
  routes.get<{ Params: { id: string } }>(
    '/runs/:id/draft',
    { schema: { params } },
    async (request) => support.draft(request.workspaceId, request.params.id),
  );
  routes.post<{
    Params: { id: string };
    Body: { text: string; version: number };
  }>(
    '/runs/:id/draft',
    {
      schema: {
        params,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['text', 'version'],
          properties: {
            text: {
              type: 'string',
              minLength: 1,
              maxLength: 6000,
              examples: [
                'Please request a new sign-in link using the same email address.',
              ],
            },
            version: {
              type: 'integer',
              minimum: 1,
              maximum: 10000,
              examples: [1],
            },
          },
        },
      },
    },
    async (request) =>
      support.edit(
        request.workspaceId,
        request.params.id,
        request.body.text,
        request.body.version,
      ),
  );
  routes.post<{
    Params: { id: string };
    Body: { key: string; version: number; escalate: boolean };
  }>(
    '/runs/:id/reply',
    {
      schema: {
        params,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['key', 'version', 'escalate'],
          properties: {
            key: {
              type: 'string',
              minLength: 8,
              maxLength: 100,
              pattern: '^[a-zA-Z0-9:_-]+$',
              examples: ['reply:review-123:1:false'],
            },
            version: {
              type: 'integer',
              minimum: 1,
              maximum: 10000,
              examples: [1],
            },
            escalate: { type: 'boolean', examples: [false] },
          },
        },
      },
    },
    async (request) =>
      support.approveReply(
        request.workspaceId,
        request.params.id,
        request.body.key,
        request.body.version,
        request.body.escalate,
      ),
  );
};
