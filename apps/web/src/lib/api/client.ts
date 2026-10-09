import {
  draftSchema,
  historyPageSchema,
  replyReceiptSchema,
  runSchema,
  sessionSchema,
  ticketPageSchema,
  ticketSchema,
  type RunEvent,
  type Session,
} from '@support-desk/contracts';
import { z } from 'zod';
import { readEventStream } from './events';
const base = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
const storageKey = 'support-desk-session-v2';
export const readSession = (): Session | null => {
  try {
    return sessionSchema.parse(
      JSON.parse(sessionStorage.getItem(storageKey) ?? 'null'),
    );
  } catch {
    return null;
  }
};
export const saveSession = (session: Session | null) => {
  if (session) sessionStorage.setItem(storageKey, JSON.stringify(session));
  else sessionStorage.removeItem(storageKey);
};
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
const request = async (
  path: string,
  init: RequestInit = {},
  authenticated = true,
) => {
  const token = readSession()?.token;
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    if (
      response.status === 401 &&
      authenticated &&
      token === readSession()?.token
    ) {
      saveSession(null);
      window.dispatchEvent(new Event('support-session-expired'));
    }
    const body = z
      .object({ message: z.string() })
      .safeParse(await response.json().catch(() => null));
    throw new ApiError(
      body.success
        ? body.data.message
        : `The request failed (${response.status}). Please retry.`,
      response.status,
    );
  }
  return response;
};
const query = (values: Record<string, string | number | undefined>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values))
    if (value !== undefined) params.set(key, String(value));
  return params.toString();
};
export const client = {
  authenticate: async (
    action: 'login' | 'register' | 'demo',
    email?: string,
    password?: string,
  ) =>
    sessionSchema.parse(
      await (
        await request(
          `/auth/${action}`,
          {
            method: 'POST',
            ...(action === 'demo'
              ? {}
              : { body: JSON.stringify({ email, password }) }),
          },
          false,
        )
      ).json(),
    ),
  me: async () =>
    z
      .object({
        workspaceId: z.string(),
        email: z.string().nullable(),
        demo: z.boolean(),
      })
      .parse(await (await request('/auth/me')).json()),
  logout: async () => {
    const token = readSession()?.token;
    await request('/auth/logout', { method: 'POST', body: '{}' });
    return token === readSession()?.token;
  },
  capabilities: async () =>
    z
      .object({ generationMode: z.enum(['deterministic', 'openrouter']) })
      .parse(await (await request('/capabilities', {}, false)).json()),
  tickets: async (status: string, cursor?: string, signal?: AbortSignal) =>
    ticketPageSchema.parse(
      await (
        await request(`/tickets?${query({ status, cursor, limit: 12 })}`, {
          signal,
        })
      ).json(),
    ),
  ticket: async (id: string) =>
    ticketSchema.parse(await (await request(`/tickets/${id}`)).json()),
  history: async (id: string, cursor?: string, signal?: AbortSignal) =>
    historyPageSchema.parse(
      await (
        await request(`/tickets/${id}/history?${query({ cursor, limit: 6 })}`, {
          signal,
        })
      ).json(),
    ),
  start: async (ticketId: string) =>
    runSchema.parse(
      await (
        await request(`/tickets/${ticketId}/runs`, {
          method: 'POST',
          body: '{}',
        })
      ).json(),
    ),
  get: async (id: string) =>
    runSchema.parse(await (await request(`/runs/${id}`)).json()),
  stream: async (
    id: string,
    after: number,
    onEvent: (event: RunEvent) => void,
    signal: AbortSignal,
  ) => {
    const response = await request(`/runs/${id}/events?after=${after}`, {
      signal,
    });
    if (!response.body) throw new Error('Streaming is unavailable.');
    await readEventStream(response.body, onEvent, signal);
  },
  cancel: async (id: string) => {
    await request(`/runs/${id}/cancel`, { method: 'POST', body: '{}' });
  },
  draft: async (id: string) =>
    draftSchema.parse(await (await request(`/runs/${id}/draft`)).json()),
  edit: async (id: string, text: string, version: number) =>
    draftSchema.parse(
      await (
        await request(`/runs/${id}/draft`, {
          method: 'POST',
          body: JSON.stringify({ text, version }),
        })
      ).json(),
    ),
  approve: async (
    id: string,
    key: string,
    version: number,
    escalate: boolean,
  ) =>
    replyReceiptSchema.parse(
      await (
        await request(`/runs/${id}/reply`, {
          method: 'POST',
          body: JSON.stringify({ key, version, escalate }),
        })
      ).json(),
    ),
};
