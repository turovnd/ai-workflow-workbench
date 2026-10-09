import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { operations } from '../schemas/operations';
export const registerDocumentation = async (app: FastifyInstance) => {
  app.addHook('onRoute', (route) => {
    const method = Array.isArray(route.method) ? route.method[0] : route.method;
    const metadata = operations[method + ' ' + route.url];
    if (metadata) route.schema = { ...route.schema, ...metadata };
  });
  await app.register(swagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Support Desk API',
        version: '1.0.0',
        description:
          'Synthetic customer support workspace. Prepare evidence-backed drafts, review source citations, edit and approve a response. No outgoing email or customer-system integration. Use POST /auth/demo or register/login, then Authorize with the returned opaque token. Sessions last 24 hours. Rate limits are per configured client IP.',
      },
      components: {
        securitySchemes: {
          session: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'Opaque 43-character session token',
            description:
              'Server-minted, workspace-scoped token. No workspace identifier from request bodies is trusted. Logout revokes this token; login replaces the prior account session.',
          },
        },
      },
      tags: [
        'System',
        'Authentication',
        'Account',
        'Tickets',
        'Preparation',
        'Review',
      ].map((name) => ({ name })),
    },
  });
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: false,
    },
  });
  app.get('/openapi.json', { schema: { hide: true } }, async () =>
    app.swagger(),
  );
};
