import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import console from 'node:console';
import { fileURLToPath, URL } from 'node:url';

const frontend = fileURLToPath(new URL('..', import.meta.url));
const backend = fileURLToPath(new URL('../../backend', import.meta.url));
const args = process.argv.slice(2);
const checking = args.includes('--check');
const urlIndex = args.indexOf('--url');
const schemaUrl = urlIndex >= 0 ? args[urlIndex + 1] : undefined;
const temporary = mkdtempSync(join(tmpdir(), 'support-api-'));
const generated = join(frontend, 'src/api/generated.ts');

const run = (command, parameters, cwd = frontend) => {
  const result = spawnSync(command, parameters, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} failed (${result.status}).`);
};

try {
  let schema =
    schemaUrl ??
    process.env.OPENAPI_URL ??
    'http://127.0.0.1:4010/openapi.json';
  if (urlIndex >= 0 && (!schemaUrl || schemaUrl.startsWith('--'))) {
    throw new Error('Provide an OpenAPI URL after --url.');
  }
  if (checking) {
    schema = join(temporary, 'openapi.json');
    run('npx', ['tsx', join(backend, 'tools/export-openapi.ts'), schema]);
  }
  const output = checking ? temporary : join(frontend, 'src/api');
  run('npx', [
    'swagger-typescript-api',
    'generate',
    '-p',
    schema,
    '-o',
    output,
    '-n',
    'generated.ts',
    '--extract-request-params',
    '--extract-request-body',
    '--extract-response-body',
  ]);
  run('npx', [
    'prettier',
    '--config',
    '../.prettierrc.json',
    '--write',
    join(output, 'generated.ts'),
  ]);
  if (checking) {
    assert.equal(
      readFileSync(join(output, 'generated.ts'), 'utf8'),
      readFileSync(generated, 'utf8'),
      'The API client differs from the backend contract. Regenerate it from the updated API.',
    );
    console.log('Generated client matches the backend contract.');
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
