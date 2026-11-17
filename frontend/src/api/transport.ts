import { z } from 'zod';
import { Api } from './generated';
import { readSession, saveSession } from './session';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const baseUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

const errorSchema = z.object({ message: z.string() });

const transport =
  (authenticated: boolean): typeof fetch =>
  async (url, init) => {
    const token = authenticated ? readSession()?.token : undefined;
    const headers = new Headers(init?.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(url, { ...init, headers });

    if (!response.ok) {
      if (
        response.status === 401 &&
        authenticated &&
        token === readSession()?.token
      ) {
        saveSession(null);
        window.dispatchEvent(new Event('support-session-expired'));
      }
      const body = errorSchema.safeParse(
        await response.json().catch(() => null),
      );
      throw new ApiError(
        body.success
          ? body.data.message
          : `The request failed (${response.status}). Please retry.`,
        response.status,
      );
    }

    if (
      authenticated &&
      token !== readSession()?.token &&
      !String(url).endsWith('/auth/logout')
    ) {
      throw new DOMException(
        'The workspace changed while this request was in flight.',
        'AbortError',
      );
    }
    return response;
  };

export const api = new Api({ baseUrl, customFetch: transport(true) });

export const publicApi = new Api({ baseUrl, customFetch: transport(false) });
