import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { test } from 'node:test';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('queue functions load without the repository or installed dependencies', async () => {
  execFileSync(process.execPath, [join(root, 'tools/build-vercel-worker.mjs')]);
  const isolated = await mkdtemp(join(tmpdir(), 'support-worker-bundle-'));

  try {
    await cp(join(root, 'modules/worker/.vercel/output'), isolated, {
      recursive: true,
    });

    for (const name of ['replies', 'recovery']) {
      const directory = join(isolated, 'functions/api', `${name}.func`);
      const config = JSON.parse(
        await readFile(join(directory, '.vc-config.json'), 'utf8'),
      );
      assert.equal(config.experimentalTriggers[0].type, 'queue/v2beta');
      assert.equal(config.shouldAddHelpers, true);
      assert.equal(
        config.experimentalTriggers[0].consumer,
        `worker-api-${name}`,
      );
      execFileSync(
        process.execPath,
        [
          '--no-experimental-require-module',
          '-e',
          'require("node:assert/strict").equal(typeof require("./index.cjs").default, "function")',
        ],
        {
          cwd: directory,
          env: {
            PATH: process.env.PATH,
            DATABASE_URL: 'postgresql://test:test@localhost:1/test',
            GENERATION_MODE: 'deterministic',
            ALLOW_LIVE_PROVIDER: 'false',
          },
        },
      );
    }
  } finally {
    await rm(isolated, { recursive: true, force: true });
  }
});
