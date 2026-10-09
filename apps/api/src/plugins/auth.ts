import type { Repository, SupportRepository } from '@support-desk/data';
import type { FastifyInstance } from 'fastify';
export const registerSessionGuard = (
  routes: FastifyInstance,
  repository: Repository,
  support?: SupportRepository,
) => {
  routes.addHook('preHandler', async (request, reply) => {
    const token = request.headers.authorization?.match(
      /^Bearer ([A-Za-z0-9_-]{43})$/,
    )?.[1];
    const workspace = token
      ? support
        ? (await support.authenticate(token))?.workspaceId
        : await repository.authenticate(token)
      : undefined;
    if (!workspace)
      return reply.code(401).send({
        message: 'Your demo session expired. Retry to create a new session.',
      });
    request.workspaceId = workspace;
  });
};
declare module 'fastify' {
  interface FastifyRequest {
    workspaceId: string;
  }
}
