import type { SupportRepository } from '@support-desk/data';
import type { FastifyInstance } from 'fastify';
import { bodyEmpty, credentials } from '../schemas/support';
export const registerAuthRoutes = (
  app: FastifyInstance,
  support: SupportRepository,
  mode: 'deterministic' | 'openrouter',
) => {
  app.get('/capabilities', async () => ({ generationMode: mode }));
  app.post(
    '/auth/demo',
    { config: { rateLimit: { max: 5, timeWindow: 60000 } } },
    async (_request, reply) => reply.code(201).send(await support.demo()),
  );
  for (const action of ['register', 'login'] as const)
    app.post<{ Body: { email: string; password: string } }>(
      `/auth/${action}`,
      {
        schema: { body: credentials },
        config: { rateLimit: { max: 10, timeWindow: 60000 } },
      },
      async (request, reply) =>
        reply
          .code(action === 'register' ? 201 : 200)
          .send(
            await support[action](
              request.body.email.trim().toLowerCase(),
              request.body.password,
            ),
          ),
    );
};
export const registerIdentityRoutes = (
  routes: FastifyInstance,
  support: SupportRepository,
) => {
  routes.get('/auth/me', async (request) =>
    support.authenticate(request.headers.authorization!.slice(7)),
  );
  routes.post(
    '/auth/logout',
    { schema: { body: bodyEmpty } },
    async (request) => {
      await support.logout(request.headers.authorization!.slice(7));
      return { ok: true };
    },
  );
};
