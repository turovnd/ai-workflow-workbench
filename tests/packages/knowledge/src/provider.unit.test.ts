import {
  cases,
  createOpenRouterGenerator,
  retrieveLocally,
} from '@support-desk/knowledge';
import { describe, expect, it, vi } from 'vitest';
const envelope = (output: unknown) =>
  new Response(
    JSON.stringify({
      choices: [
        { finish_reason: 'stop', message: { content: JSON.stringify(output) } },
      ],
    }),
    { status: 200 },
  );
describe('OpenRouter contract', () => {
  it('validates exact citations and requires provider parameter support', async () => {
    const evidence = retrieveLocally(cases[0].query);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      envelope({
        summary: 'Request a fresh link.',
        reply: 'Please request a fresh sign-in link.',
        citations: [
          {
            id: evidence[0].id,
            quote: evidence[0].text.split('. ')[0] + '.',
          },
        ],
      }),
    );
    const generate = createOpenRouterGenerator({
      apiKey: 'test-only-key',
      model: 'test/model',
      fetcher,
    });
    const brief = await generate(cases[0], evidence);
    expect(brief.citations).toHaveLength(1);
    const body = JSON.parse(String(fetcher.mock.calls[0][1]?.body));
    expect(body.provider.require_parameters).toBe(true);
    expect(body.max_tokens).toBe(1200);
    expect(body.response_format.json_schema.strict).toBe(true);
  });
  it('rejects a fabricated source quote without falling back', async () => {
    const evidence = retrieveLocally(cases[0].query);
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      envelope({
        summary: 'Bad',
        reply: 'Bad',
        citations: [
          { id: evidence[0].id, quote: 'Send your password to support.' },
        ],
      }),
    );
    await expect(
      createOpenRouterGenerator({ apiKey: 'test', model: 'test', fetcher })(
        cases[0],
        evidence,
      ),
    ).rejects.toThrow('citation');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('abstains with missing evidence without spending provider tokens', async () => {
    const fetcher = vi.fn<typeof fetch>();
    const result = await createOpenRouterGenerator({
      apiKey: 'test',
      model: 'test',
      fetcher,
    })(cases[2], []);
    expect(result.citations).toHaveLength(0);
    expect(result.reply).toContain('Could you share');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('bounds the UTF-8 response bytes before parsing, including multibyte text', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('界'.repeat(12000)));
    await expect(
      createOpenRouterGenerator({ apiKey: 'test', model: 'test', fetcher })(
        cases[0],
        retrieveLocally(cases[0].query),
      ),
    ).rejects.toThrow('size limit');
  });
  it('surfaces provider rejection with no retry or secret in its error', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response('secret provider diagnostics', { status: 429 }),
      );
    await expect(
      createOpenRouterGenerator({
        apiKey: 'never-log-this-key',
        model: 'test',
        fetcher,
      })(cases[0], retrieveLocally(cases[0].query)),
    ).rejects.toThrow('429');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
