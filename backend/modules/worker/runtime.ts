import { loadConfig } from '@support-desk/config';
import { createRepository } from '@support-desk/data';
import { createOpenRouterGenerator } from '@support-desk/knowledge';
import { Pool } from 'pg';

const config = loadConfig(true);

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 3,
  connectionTimeoutMillis: 5000,
  statement_timeout: 15000,
  idleTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

export const repository = createRepository(
  pool,
  config.GENERATION_MODE === 'openrouter'
    ? createOpenRouterGenerator({
        apiKey: config.OPENROUTER_API_KEY!,
        model: config.OPENROUTER_MODEL,
      })
    : undefined,
  config.ALLOW_LIVE_PROVIDER === 'true' ? config.LIVE_CALL_BUDGET : 0,
);
