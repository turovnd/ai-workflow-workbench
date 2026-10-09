import { eventSchema, type RunEvent } from '@support-desk/contracts';
export const readEventStream = async (
  body: ReadableStream<Uint8Array>,
  onEvent: (event: RunEvent) => void,
  signal: AbortSignal,
) => {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (!signal.aborted) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      if (buffer.length > 128_000)
        throw new Error('Event stream exceeded the buffer limit.');
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary = buffer.indexOf('\n\n');
      while (boundary >= 0) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = frame
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n');
        if (data) onEvent(eventSchema.parse(JSON.parse(data)));
        boundary = buffer.indexOf('\n\n');
      }
      if (done) break;
    }
  } finally {
    await reader.cancel();
    reader.releaseLock();
  }
};
