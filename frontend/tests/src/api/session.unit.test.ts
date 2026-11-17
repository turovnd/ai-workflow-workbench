import { client, readSession, saveSession } from '@support-desk/web/api';
import { afterEach, expect, it, vi } from 'vitest';
const a = {
  token: 'a'.repeat(43),
  workspaceId: 'b645bb14-7835-4e44-bca4-5726fa53bf09',
  email: null,
  demo: true,
};
const b = { ...a, token: 'b'.repeat(43) };
const setup = () => {
  const data = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
  const events = vi.fn();
  vi.stubGlobal('window', { dispatchEvent: events });
  return events;
};
afterEach(() => vi.unstubAllGlobals());
it('a delayed unauthorized response cannot revoke a newly authenticated session', async () => {
  const events = setup();
  let complete!: (response: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    ),
  );
  saveSession(a);
  const request = client.me();
  const rejected = expect(request).rejects.toThrow();
  saveSession(b);
  complete(
    new Response(JSON.stringify({ message: 'Expired' }), { status: 401 }),
  );
  await rejected;
  expect(readSession()?.token).toBe(b.token);
  expect(events).not.toHaveBeenCalled();
});
it('a late logout signals that it no longer owns the current session', async () => {
  setup();
  let complete!: (response: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          complete = resolve;
        }),
    ),
  );
  saveSession(a);
  const request = client.logout();
  saveSession(b);
  complete(new Response(null, { status: 204 }));
  expect(await request).toBe(false);
  expect(readSession()?.token).toBe(b.token);
});
