import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import type { Repository, SupportRepository } from '@support-desk/data';
import Fastify from 'fastify';
import {
  registerDocumentation,
  registerErrors,
  registerSessionGuard,
} from './plugins';
import {
  registerAuthRoutes,
  registerDraftRoutes,
  registerEventRoutes,
  registerIdentityRoutes,
  registerRunRoutes,
  registerTicketRoutes,
} from './routes';
export const createApp = async (
  repository: Repository,
  origins: string[],
  trustedProxies: string[] = [],
  support?: SupportRepository,
  generationMode: 'deterministic' | 'openrouter' = 'deterministic',
) => {
  const app = Fastify({
    trustProxy: trustedProxies.length ? trustedProxies : false,
    logger: { redact: ['req.headers.authorization'] },
    bodyLimit: 32768,
    ajv: { customOptions: { coerceTypes: false, removeAdditional: false } },
    requestTimeout: 15_000,
  });
  app.decorateRequest('workspaceId', '');
  await app.register(cors, {
    origin: origins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  });
  await app.register(rateLimit, { max: 120, timeWindow: 60_000 });

  registerErrors(app);
  await registerDocumentation(app);
  app.get('/health', async () => {
    await repository.health();
    return { status: 'ok', mode: generationMode };
  });
  if (support) registerAuthRoutes(app, support, generationMode);
  else
    app.post(
      '/sessions',
      { config: { rateLimit: { max: 5, timeWindow: 60_000 } } },
      async (_request, reply) =>
        reply.code(201).send(await repository.createSession()),
    );
  await app.register(async (routes) => {
    registerSessionGuard(routes, repository, support);
    if (support) {
      registerIdentityRoutes(routes, support);
      registerTicketRoutes(routes, support, repository, generationMode);
      registerDraftRoutes(routes, support);
    }
    registerRunRoutes(routes, repository, support);
    registerEventRoutes(routes, repository, origins);
  });
  return app;
};
