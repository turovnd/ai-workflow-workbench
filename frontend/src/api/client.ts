import {
  draftSchema,
  historyPageSchema,
  replyReceiptSchema,
  runSchema,
  sessionSchema,
  ticketPageSchema,
  ticketSchema,
  type RunEvent,
} from '@support-desk/contracts';
import { z } from 'zod';
import { readEventStream } from './events';
import { api, publicApi } from './transport';
import { readSession } from './session';

export const client = {
  authenticate: async (
    action: 'login' | 'register' | 'demo',
    email = '',
    password = '',
  ) => {
    const response =
      action === 'demo'
        ? await publicApi.auth.postAuthDemo()
        : action === 'register'
          ? await publicApi.auth.postAuthRegister({ email, password })
          : await publicApi.auth.postAuthLogin({ email, password });
    return sessionSchema.parse(response.data);
  },
  me: async () =>
    sessionSchema
      .omit({ token: true })
      .parse((await api.auth.getAuthMe()).data),
  logout: async () => {
    const token = readSession()?.token;
    await api.auth.postAuthLogout({});
    return token === readSession()?.token;
  },
  capabilities: async () =>
    z
      .object({ generationMode: z.enum(['deterministic', 'openrouter']) })
      .parse((await publicApi.capabilities.getCapabilities()).data),
  tickets: async (status: string, cursor?: string, signal?: AbortSignal) =>
    ticketPageSchema.parse(
      (
        await api.tickets.getTickets(
          {
            status: z.enum(['all', 'open', 'resolved']).parse(status),
            cursor,
            limit: '12',
          },
          { signal },
        )
      ).data,
    ),
  ticket: async (id: string) =>
    ticketSchema.parse((await api.tickets.getTicketsId({ id })).data),
  history: async (id: string, cursor?: string, signal?: AbortSignal) =>
    historyPageSchema.parse(
      (
        await api.tickets.getTicketsIdHistory(
          { id, cursor, limit: '6' },
          { signal },
        )
      ).data,
    ),
  start: async (id: string) =>
    runSchema.parse((await api.tickets.postTicketsIdRuns({ id }, {})).data),
  get: async (id: string, signal?: AbortSignal) =>
    runSchema.parse((await api.runs.getRunsId({ id }, { signal })).data),
  stream: async (
    id: string,
    after: number,
    onEvent: (event: RunEvent) => void,
    signal: AbortSignal,
  ) => {
    const response = await api.runs.getRunsIdEvents(
      { id, after: String(after) },
      { signal },
    );
    if (!response.body) throw new Error('Streaming is unavailable.');
    await readEventStream(response.body, onEvent, signal);
  },
  cancel: async (id: string) => {
    await api.runs.postRunsIdCancel({ id }, {});
  },
  draft: async (id: string) =>
    draftSchema.parse((await api.runs.getRunsIdDraft({ id })).data),
  edit: async (id: string, text: string, version: number) =>
    draftSchema.parse(
      (await api.runs.postRunsIdDraft({ id }, { text, version })).data,
    ),
  approve: async (
    id: string,
    key: string,
    version: number,
    escalate: boolean,
  ) =>
    replyReceiptSchema.parse(
      (await api.runs.postRunsIdReply({ id }, { key, version, escalate })).data,
    ),
};
