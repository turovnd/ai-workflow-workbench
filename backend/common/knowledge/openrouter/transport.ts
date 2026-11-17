import { envelopeSchema } from './schemas';

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly retryable = false,
  ) {
    super(message);
  }
}

type CompletionOptions = {
  apiKey: string;
  fetcher: typeof fetch;
  payload: object;
  timeoutMs: number;
};

export const complete = async ({
  apiKey,
  fetcher,
  payload,
  timeoutMs,
}: CompletionOptions): Promise<string> => {
  let response: Response;
  try {
    response = await fetcher('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ProviderError('The AI provider could not be reached.', true);
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new ProviderError(
      `The AI provider rejected the request (${response.status}).`,
      response.status === 429 || response.status >= 500,
    );
  }
  if (!response.body)
    throw new Error('The model provider returned an empty response.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let body = '';
  let bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      bytes += chunk.value?.byteLength ?? 0;
      if (bytes > 32768)
        throw new Error('The provider response exceeded the size limit.');
      body += decoder.decode(chunk.value, { stream: !chunk.done });
      if (chunk.done) break;
    }
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        ['AbortError', 'TimeoutError'].includes(error.name))
    ) {
      throw new ProviderError('The AI response was interrupted.', true);
    }
    throw error;
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }

  const envelope = envelopeSchema.parse(JSON.parse(body));
  if (envelope.choices[0].finish_reason !== 'stop')
    throw new ProviderError('The AI reply was incomplete.');
  return envelope.choices[0].message.content;
};
