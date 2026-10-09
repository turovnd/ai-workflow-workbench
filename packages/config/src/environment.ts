import { z } from 'zod';
const schema = z.object({
  ALLOW_LIVE_PROVIDER: z.enum(['true', 'false']).default('false'),
  LIVE_CALL_BUDGET: z.coerce.number().int().min(0).max(10).default(2),
  GENERATION_MODE: z
    .enum(['deterministic', 'openrouter'])
    .default('deterministic'),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('openai/gpt-4.1-mini'),
  TRUST_PROXY: z.string().default(''),
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().min(1024).max(65535).default(4010),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://127.0.0.1:5173'),
});
export const loadConfig = () => {
  const config = schema.parse(process.env);
  if (
    config.GENERATION_MODE === 'openrouter' &&
    config.ALLOW_LIVE_PROVIDER !== 'true'
  )
    throw new Error(
      'Live provider mode is disabled. Explicit enablement is required.',
    );
  if (config.GENERATION_MODE === 'openrouter' && !config.OPENROUTER_API_KEY)
    throw new Error('OpenRouter mode requires a server-side key.');
  return config;
};
