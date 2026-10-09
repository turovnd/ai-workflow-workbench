import { readEventStream } from '@support-desk/web/events';
import { describe, expect, it } from 'vitest';
describe('event transport', () => {
  it('parses fragmented UTF-8 and multiline boundaries without token loss', async () => {
    const text =
      'data: ' +
      JSON.stringify({ seq: 1, type: 'draft', data: 'Résumé ✓' }) +
      '\n\n';
    const bytes = new TextEncoder().encode(text);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
        controller.close();
      },
    });
    const found: unknown[] = [];
    await readEventStream(
      stream,
      (event) => found.push(event),
      new AbortController().signal,
    );
    expect(found).toEqual([{ seq: 1, type: 'draft', data: 'Résumé ✓' }]);
  });
  it('does not interpret a stream-level failure as success', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            'data: {"seq":2,"type":"failed","data":"Provider unavailable"}\n\n',
          ),
        );
        controller.close();
      },
    });
    const found: unknown[] = [];
    await readEventStream(
      stream,
      (event) => found.push(event),
      new AbortController().signal,
    );
    expect(found).toEqual([
      { seq: 2, type: 'failed', data: 'Provider unavailable' },
    ]);
  });
});
