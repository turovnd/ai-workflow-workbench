import { z } from 'zod';
import type {
  Brief,
  EvidenceDocument,
  ReviewCase,
} from '@support-desk/contracts';
import { validateEvidence } from '../brief';
import { outputSchema } from './schemas';
import { systemPrompt } from './prompt';
import { complete } from './transport';

export type ReplyGenerator = (
  ticket: ReviewCase,
  evidence: readonly EvidenceDocument[],
) => Promise<Brief>;

type GeneratorOptions = {
  apiKey: string;
  model: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  maxTokens?: number;
};

export const createOpenRouterGenerator =
  ({
    apiKey,
    model,
    fetcher = fetch,
    timeoutMs = 45_000,
    maxTokens = 1200,
  }: GeneratorOptions): ReplyGenerator =>
  async (ticket, evidence) => {
    const current = evidence.filter((document) => document.current);
    const schema = z.toJSONSchema(outputSchema);
    delete schema.$schema;
    const output = outputSchema.parse(
      JSON.parse(
        await complete({
          apiKey,
          fetcher,
          timeoutMs,
          payload: {
            model,
            max_tokens: maxTokens,
            temperature: 0,
            provider: { require_parameters: true, data_collection: 'deny' },
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: JSON.stringify({
                  ticket: ticket.description,
                  evidence: current.map(({ id, text }) => ({ id, text })),
                }),
              },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: { name: 'support_reply', strict: true, schema },
            },
          },
        }),
      ),
    );

    if (current.length && !output.citations.length)
      throw new Error('The AI reply did not cite the available evidence.');
    const citations = output.citations.map((citation) => {
      const source = current.find((document) => document.id === citation.id);
      if (!source || !source.text.includes(citation.quote))
        throw new Error('The AI citation does not match the supplied article.');
      return {
        ...citation,
        title: source.title,
        revision: source.revision,
        section: source.section,
        text: source.text,
      };
    });
    if (new Set(citations.map(({ id }) => id)).size !== citations.length)
      throw new Error('The AI returned duplicate citations.');

    const brief: Brief = {
      proposal: null,
      summary: output.summary,
      reply: output.reply,
      citations,
      findings: citations.map((citation) => ({
        text: citation.quote,
        citationId: citation.id,
      })),
      caution: 'AI draft. Check the sources and your edits before approval.',
    };
    validateEvidence(brief, current);
    return brief;
  };

export { ProviderError } from './transport';
