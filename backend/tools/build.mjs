import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
const app = process.argv[2];
if (!['api', 'worker'].includes(app)) throw new Error('Choose api or worker.');
const external = new Set();
for (const folder of [
  'backend/modules/api',
  'backend/modules/worker',
  'backend/common/data',
  'backend/common/knowledge',
  'backend/common/config',
  'backend/common/contracts',
  'backend/common/queue',
]) {
  const manifest = JSON.parse(
    await readFile(resolve(root, folder, 'package.json'), 'utf8'),
  );
  for (const name of Object.keys(manifest.dependencies ?? {}))
    if (!name.startsWith('@support-desk/')) external.add(name);
}
await build({
  entryPoints: [
    resolve(root, `backend/modules/${app}/main.ts`),
    ...(app === 'api' ? [resolve(root, 'backend/modules/api/migrate.ts')] : []),
  ],
  outdir: resolve(root, `backend/modules/${app}/dist`),
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'esm',
  external: [...external],
  outExtension: { '.js': '.mjs' },
  logLevel: 'info',
});
