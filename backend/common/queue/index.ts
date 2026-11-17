import { QueueClient } from '@vercel/queue';
import { z } from 'zod';

export const queue = new QueueClient({ region: 'iad1' });

export const jobMessage = z.object({ runId: z.string().uuid() }).strict();

export type PublishJob = (runId: string) => Promise<void>;

export const publishJob: PublishJob = async (runId) => {
  await queue.send(
    'support-replies',
    { runId },
    {
      idempotencyKey: `reply:${runId}`,
      retentionSeconds: 86400,
    },
  );
};

export const republishJob = async (runId: string) => {
  await queue.send(
    'support-replies',
    { runId },
    {
      idempotencyKey: `recovery:${runId}:${Math.floor(Date.now() / 60000)}`,
      retentionSeconds: 86400,
    },
  );
};
