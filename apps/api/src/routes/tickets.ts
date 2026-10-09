import type { Repository, SupportRepository } from '@support-desk/data';
import type { FastifyInstance } from 'fastify';
import { bodyEmpty, pagination, params } from '../schemas/support';
export const registerTicketRoutes = (
  routes: FastifyInstance,
  support: SupportRepository,
  core: Repository,
  mode: 'deterministic' | 'openrouter',
) => {
  routes.get<{
    Querystring: {
      status?: 'all' | 'open' | 'resolved';
      limit?: string;
      cursor?: string;
    };
  }>(
    '/tickets',
    {
      schema: {
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: {
            ...pagination,
            status: { type: 'string', enum: ['all', 'open', 'resolved'] },
          },
        },
      },
    },
    async (request) =>
      support.tickets(
        request.workspaceId,
        request.query.status ?? 'all',
        Number(request.query.limit ?? 12),
        request.query.cursor,
      ),
  );
  routes.get<{ Params: { id: string } }>(
    '/tickets/:id',
    { schema: { params } },
    async (request) =>
      support.getTicket(request.workspaceId, request.params.id),
  );
  routes.get<{
    Params: { id: string };
    Querystring: { limit?: string; cursor?: string };
  }>(
    '/tickets/:id/history',
    {
      schema: {
        params,
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: pagination,
        },
      },
    },
    async (request) =>
      support.history(
        request.workspaceId,
        request.params.id,
        Number(request.query.limit ?? 8),
        request.query.cursor,
      ),
  );
  routes.post<{ Params: { id: string } }>(
    '/tickets/:id/runs',
    { schema: { params, body: bodyEmpty } },
    async (request, reply) => {
      const id = await support.start(
        request.workspaceId,
        request.params.id,
        mode,
      );
      return reply.code(201).send(await core.getRun(request.workspaceId, id));
    },
  );
};
