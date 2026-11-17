# Local setup

## Docker

```sh
cp -n .env.example .env
# Set POSTGRES_PASSWORD; preserve any existing configuration.
docker compose --profile local up --build --wait -d
```

UI: `http://127.0.0.1:4173`. API and Swagger: `http://127.0.0.1:4010/docs/`. PostgreSQL is private to the Compose network. A migration service must finish before the API and worker start. Use `API_PORT` and `WEB_PORT` to avoid occupied ports. `docker compose --profile local down` retains the database volume; do not add `-v` unless intentionally discarding local data.

The frontend Dockerfile uses one nginx configuration to serve static files and proxy `/api`. Vercel serves the frontend directly and does not use nginx. Images use explicit version tags to make runtime upgrades deliberate; `alpine` is the base image family, not an application version.

## Real AI

Set the following in the ignored `.env` file:

```dotenv
GENERATION_MODE=openrouter
ALLOW_LIVE_PROVIDER=true
OPENROUTER_API_KEY=your-server-side-key
OPENROUTER_MODEL=openai/gpt-4.1-mini
LIVE_CALL_BUDGET=-1
```

Restart API and worker after configuration changes. Only the worker receives the OpenRouter key. `-1` removes the application's lifetime call cap; a nonnegative value sets an optional durable admission ceiling. A claimed model attempt consumes that allowance even if it fails. Provider account limits still apply. The worker permits at most three attempts per preparation and requests at most 1,200 output tokens per attempt.

Sample mode is for offline development and deterministic tests. Its UI says **Sample response**. OpenRouter failures remain failures; they never substitute sample text.

## Native development

```sh
npm ci
npm run dev
```

Vite serves port 5173 and proxies `/api` to port 4010. For a native API/worker, export `DATABASE_URL` pointing to an isolated PostgreSQL database, run `npm run db:migrate`, then run `npm run dev:api` and `npm run dev:worker` in separate terminals. Native commands consume process environment, not `.env` implicitly.

`CORS_ORIGINS` configures exact allowed origins for separate-origin development. The hosted frontend uses relative `/api` URLs. Do not put credentials in `VITE_*` variables; they are public.
