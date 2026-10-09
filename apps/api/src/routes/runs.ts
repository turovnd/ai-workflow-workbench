import type { Repository, SupportRepository } from '@support-desk/data';
import type { FastifyInstance } from 'fastify';
import { emptyBody, idParams } from '../schemas/common';
export const registerRunRoutes = (
  routes: FastifyInstance,
  repository: Repository,
  support?: SupportRepository,
) => {
  if (!support)
    routes.post<{ Body: { caseId: string } }>(
      '/runs',
      {
        schema: {
          body: {
            type: 'object',
            additionalProperties: false,
            required: ['caseId'],
            properties: {
              caseId: {
                type: 'string',
                enum: ['account-access', 'billing-invoice', 'retention-gap'],
              },
            },
          },
        },
        config: { rateLimit: { max: 20, timeWindow: 60_000 } },
      },
      async (request, reply) => {
        const id = await repository.createRun(
          request.workspaceId,
          request.body.caseId,
        );
        return reply
          .code(201)
          .send(await repository.getRun(request.workspaceId, id));
      },
    );
  routes.get<{ Params: { id: string } }>(
    '/runs/:id',
    { schema: { params: idParams } },
    async (request) =>
      repository.getRun(request.workspaceId, request.params.id),
  );
  if (!support)
    routes.post<{
      Params: { id: string };
      Body: { key: string; version: number };
    }>(
      '/runs/:id/approve',
      {
        schema: {
          params: idParams,
          body: {
            type: 'object',
            additionalProperties: false,
            required: ['key', 'version'],
            properties: {
              key: {
                type: 'string',
                minLength: 8,
                maxLength: 100,
                pattern: '^[a-zA-Z0-9:_-]+$',
              },
              version: { type: 'integer', minimum: 1, maximum: 100 },
            },
          },
        },
      },
      async (request) =>
        repository.approve(
          request.workspaceId,
          request.params.id,
          request.body.key,
          request.body.version,
        ),
    );
  routes.post<{ Params: { id: string } }>(
    '/runs/:id/cancel',
    { schema: { params: idParams, body: emptyBody } },
    async (request) => {
      await repository.cancel(request.workspaceId, request.params.id);
      return { status: 'cancelled' };
    },
  );
};
