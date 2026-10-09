import { loadConfig } from '@support-desk/config';
import { createRepository } from '@support-desk/data';
import { createOpenRouterGenerator } from '@support-desk/knowledge';
import { setTimeout as wait } from 'node:timers/promises';
import { Pool } from 'pg';
const config = loadConfig();
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 5000,
  statement_timeout: 15_000,
});
const repository = createRepository(
  pool,
  config.GENERATION_MODE === 'openrouter'
    ? createOpenRouterGenerator({
        apiKey: config.OPENROUTER_API_KEY!,
        model: config.OPENROUTER_MODEL,
      })
    : undefined,
  config.ALLOW_LIVE_PROVIDER === 'true' ? config.LIVE_CALL_BUDGET : 0,
);
let stopping = false;
let nextCleanup = 0;
process.once('SIGTERM', () => {
  stopping = true;
});
process.once('SIGINT', () => {
  stopping = true;
});
try {
  while (!stopping) {
    if (Date.now() >= nextCleanup) {
      await repository.cleanup();
      nextCleanup = Date.now() + 60_000;
    }
    const job = await repository.claim();
    if (!job) {
      await wait(500);
      continue;
    }
    try {
      const brief = await repository.compute(job.run_id, job.fence);
      await repository.complete(job.run_id, job.fence, brief);
      console.info(
        JSON.stringify({
          event: 'job_complete',
          runId: job.run_id,
          fence: job.fence,
        }),
      );
    } catch (error) {
      console.error(
        JSON.stringify({
          event: 'job_retry',
          runId: job.run_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
      if (config.GENERATION_MODE === 'openrouter')
        await repository.fail(
          job.run_id,
          job.fence,
          'The model could not produce a validated reply. Review the evidence and retry explicitly.',
        );
      else await repository.retry(job.run_id, job.fence);
    }
  }
} finally {
  await pool.end();
}
