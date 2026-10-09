import { loadConfig } from '@support-desk/config';
import { createRepository, createSupportRepository } from '@support-desk/data';
import { Pool } from 'pg';
import { createApp } from './app';
const config = loadConfig();
const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30_000,
});
const repository = createRepository(pool);
const app = await createApp(
  repository,
  config.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  config.TRUST_PROXY.split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  createSupportRepository(pool, repository),
  config.GENERATION_MODE,
);
await app.listen({ host: '0.0.0.0', port: config.PORT });
const shutdown = async () => {
  await app.close();
  await pool.end();
};
process.once('SIGTERM', () => void shutdown());
process.once('SIGINT', () => void shutdown());
