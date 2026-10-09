import type { FastifySchema } from 'fastify';
import {
  errorResponses,
  eventResponse,
  responseSchemas as r,
} from './responses';
const operation = (
  summary: string,
  tag: string,
  response: object,
  status = 200,
  description = '',
): FastifySchema => ({
  summary,
  tags: [tag],
  description,
  security:
    tag === 'Authentication' || tag === 'System' ? [] : [{ session: [] }],
  response: { [status]: response, ...errorResponses },
});
export const operations: Record<string, FastifySchema> = {
  'GET /health': operation(
    'Check service and database readiness',
    'System',
    r.health,
  ),
  'GET /capabilities': operation(
    'Read the configured generation mode',
    'System',
    r.capabilities,
  ),
  'POST /auth/demo': operation(
    'Create an isolated synthetic workspace',
    'Authentication',
    r.session,
    201,
    'Returns one bearer session. Anonymous workspace and its data expire after 24 hours; at most 5 creations per minute per client IP.',
  ),
  'POST /auth/register': operation(
    'Register a personal email/password account',
    'Authentication',
    r.session,
    201,
    'Email is an unverified local identity; no email is sent. Password length 12–128 characters. Account data survives anonymous retention cleanup. At most 10 attempts/minute.',
  ),
  'POST /auth/login': operation(
    'Sign in and replace the previous session',
    'Authentication',
    r.session,
    200,
    'Returns a new 24-hour bearer session and revokes the previous session for this account. At most 10 attempts/minute.',
  ),
  'GET /auth/me': {
    ...operation('Read the current workspace identity', 'Account', r.identity),
    security: [{ session: [] }],
  },
  'POST /auth/logout': operation(
    'Revoke the current session',
    'Account',
    r.logout,
  ),
  'GET /tickets': operation(
    'List tickets using a stable numeric keyset',
    'Tickets',
    r.tickets,
    200,
    'Default limit 12; range 1–50. Results order by descending numeric sequence. Opaque signed cursor is bound to workspace and status filter and fixes an insertion ceiling. Status membership remains live: resolved tickets leave an open list. Refresh without a cursor to see changed membership or new inserts. Invalid, tampered or differently scoped cursors return 400.',
  ),
  'GET /tickets/:id': operation('Read one ticket', 'Tickets', r.ticket),
  'GET /tickets/:id/history': operation(
    'Read persisted ticket history',
    'Tickets',
    r.history,
    200,
    'Default limit 8; range 1–50. Descending numeric sequence. Opaque signed cursor is bound to this workspace and ticket and fixes an insertion ceiling. Refresh without a cursor to include new entries.',
  ),
  'POST /tickets/:id/runs': operation(
    'Prepare a grounded reply asynchronously',
    'Preparation',
    r.run,
    201,
    'Creates a persisted queued run and durable worker job. At most 20 preparations/workspace, including at most 3 live-provider preparations; global paid-call admission is separately bounded. No email is sent.',
  ),
  'GET /runs/:id': operation(
    'Read the latest preparation state',
    'Preparation',
    r.run,
  ),
  'GET /runs/:id/events': operation(
    'Resume persisted preparation events',
    'Preparation',
    eventResponse,
  ),
  'POST /runs/:id/cancel': operation(
    'Cancel preparation and fence pending worker completion',
    'Preparation',
    r.cancel,
  ),
  'GET /runs/:id/draft': operation(
    'Read the current editable or approved draft',
    'Review',
    r.draft,
  ),
  'POST /runs/:id/draft': operation(
    'Save a reviewer edit with optimistic version checking',
    'Review',
    r.draft,
    200,
    'Text must contain 1–6000 characters, including Unicode. Submit the currently observed draft version. A successful edit increments the version and marks the draft as edited. Approved replies are immutable; stale versions return 409.',
  ),
  'POST /runs/:id/reply': operation(
    'Confirm the exact reply and optional internal escalation',
    'Review',
    r.receipt,
    200,
    'Human confirmation only. Use a unique key for this exact run/version/escalation intent. Repeating the same key and intent returns the same stored effect with replayed=true. Reusing it with changed intent or submitting a stale version returns 409. Saves history and resolves the ticket atomically. No email is sent.',
  ),
  'POST /sessions': operation(
    'Create a legacy demo session',
    'Authentication',
    r.legacySession,
    201,
  ),
  'POST /runs': operation(
    'Prepare a legacy evidence case',
    'Preparation',
    r.run,
    201,
  ),
  'POST /runs/:id/approve': operation(
    'Approve a legacy internal task',
    'Review',
    r.approval,
  ),
};
