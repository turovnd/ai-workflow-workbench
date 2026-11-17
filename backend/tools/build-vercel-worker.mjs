import { build } from 'esbuild';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'));
const service = config.services.worker;
const workspace = resolve(root, service.root);
const output = resolve(workspace, '.vercel/output');

// A frameworkless service needs explicit functions in the Build Output API.
// Keep subscriptions and duration limits in vercel.json as the source of truth.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'config.json'), JSON.stringify({ version: 3 }));

for (const [source, options] of Object.entries(service.functions)) {
  const name = source.replace(/\.ts$/, '');
  const directory = resolve(output, 'functions', `${name}.func`);

  await mkdir(directory, { recursive: true });
  await build({
    entryPoints: [resolve(workspace, source)],
    outfile: resolve(directory, 'index.cjs'),
    bundle: true,
    platform: 'node',
    target: 'node24',
    format: 'cjs',
    // pg loads this optional native driver only when explicitly requested.
    external: ['pg-native'],
    logLevel: 'info',
  });
  await writeFile(
    resolve(directory, '.vc-config.json'),
    JSON.stringify({
      runtime: 'nodejs24.x',
      handler: 'index.cjs',
      launcherType: 'Nodejs',
      shouldAddHelpers: true,
      ...options,
      experimentalTriggers: options.experimentalTriggers.map((trigger) => ({
        ...trigger,
        consumer: `worker-${name.replaceAll('/', '-')}`,
      })),
    }),
  );
}
