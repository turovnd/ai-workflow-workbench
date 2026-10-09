import type { Repository } from '@support-desk/data';
import type { FastifyInstance } from 'fastify';
import { setTimeout as wait } from 'node:timers/promises';
import { idParams } from '../schemas/common';
export const registerEventRoutes = (
  routes: FastifyInstance,
  repository: Repository,
  origins: string[],
) => {
  routes.get<{ Params: { id: string }; Querystring: { after?: string } }>(
    '/runs/:id/events',
    {
      schema: {
        params: idParams,
        querystring: {
          type: 'object',
          additionalProperties: false,
          properties: { after: { type: 'string', pattern: '^[0-9]{1,9}$' } },
        },
      },
    },
    async (request, reply) => {
      await repository.getRun(request.workspaceId, request.params.id);
      reply.hijack();
      const headers: Record<string, string> = {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      };
      const origin = request.headers.origin;
      if (origin && origins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers.Vary = 'Origin';
      }
      reply.raw.writeHead(200, headers);
      reply.raw.flushHeaders();
      const controller = new AbortController();
      reply.raw.on('close', () => controller.abort());
      const deadline = Date.now() + 90_000;
      let cursor = Number(request.query.after ?? 0);
      try {
        while (!controller.signal.aborted && Date.now() < deadline) {
          const events = await repository.events(
            request.workspaceId,
            request.params.id,
            cursor,
          );
          for (const event of events) {
            if (
              !reply.raw.write(
                `id: ${event.seq}\ndata: ${JSON.stringify(event)}\n\n`,
              )
            ) {
              reply.raw.end();
              return;
            }
            cursor = event.seq;
          }
          const run = await repository.getRun(
            request.workspaceId,
            request.params.id,
          );
          if (['ready', 'failed', 'cancelled'].includes(run.status)) {
            for (const event of await repository.events(
              request.workspaceId,
              request.params.id,
              cursor,
            )) {
              if (
                !reply.raw.write(
                  `id: ${event.seq}\ndata: ${JSON.stringify(event)}\n\n`,
                )
              ) {
                reply.raw.end();
                return;
              }
            }
            break;
          }
          reply.raw.write(': heartbeat\n\n');
          await wait(500, undefined, { signal: controller.signal });
        }
      } catch (error) {
        if (!controller.signal.aborted)
          request.log.error(error, 'Stream interrupted');
      } finally {
        reply.raw.end();
      }
    },
  );
};
