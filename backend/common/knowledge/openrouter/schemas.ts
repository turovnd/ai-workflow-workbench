import { z } from 'zod';

export const outputSchema = z
  .object({
    summary: z.string().min(1).max(500),
    reply: z.string().min(1).max(6000),
    citations: z
      .array(
        z
          .object({ id: z.string(), quote: z.string().min(1).max(1500) })
          .strict(),
      )
      .max(4),
  })
  .strict();

export const envelopeSchema = z.object({
  choices: z
    .array(
      z.object({
        finish_reason: z.string().nullable(),
        message: z.object({ content: z.string() }),
      }),
    )
    .min(1),
});
