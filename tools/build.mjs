import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const app = process.argv[2];
if (!['api', 'worker'].includes(app)) throw new Error('Choose api or worker.');
const external = new Set();
for (const folder of [
  'apps/api',
  'apps/worker',
  'packages/data',
  'packages/knowledge',
  'packages/config',
  'packages/contracts',
]) {
  const manifest = JSON.parse(
    await readFile(resolve(root, folder, 'package.json'), 'utf8'),
  );
  for (const name of Object.keys(manifest.dependencies ?? {}))
    if (!name.startsWith('@support-desk/')) external.add(name);
}
await build({
  entryPoints: [
    resolve(root, `apps/${app}/src/main.ts`),
    ...(app === 'api' ? [resolve(root, 'apps/api/src/migrate.ts')] : []),
  ],
  outdir: resolve(root, `apps/${app}/dist`),
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  external: [...external],
  outExtension: { '.js': '.mjs' },
  logLevel: 'info',
});
