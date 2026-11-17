import { createRepository } from '@support-desk/data';
import { buildBrief, ProviderError } from '@support-desk/knowledge';
import { processJob } from '@support-desk/worker/process';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pool } from '../../common/data/helpers';

test('transient provider failures retry through a fresh lease, then duplicate delivery is a no-op', async () => {
  let calls = 0;
  const repository = createRepository(
    pool,
    async (ticket, evidence) => {
      calls++;
      if (calls === 1)
        throw new ProviderError('Temporary provider failure', true);
      return buildBrief(ticket, evidence);
    },
    -1,
  );
  const { workspaceId } = await repository.createSession();
  const id = await repository.createRun(
    workspaceId,
    'account-access',
    null,
    'openrouter',
  );
  await processJob(repository, id);
  assert.equal(await repository.isPending(id), true);
  await pool.query('UPDATE jobs SET available_at=now() WHERE run_id=$1', [id]);
  await processJob(repository, id);
  assert.equal((await repository.getRun(workspaceId, id)).status, 'ready');
  assert.equal(await processJob(repository, id), false);
  assert.equal(calls, 2);
});

test('invalid provider output fails visibly without a sample response or automatic retry', async () => {
  let calls = 0;
  const repository = createRepository(
    pool,
    async () => {
      calls++;
      throw new Error('Invalid evidence');
    },
    -1,
  );
  const { workspaceId } = await repository.createSession();
  const id = await repository.createRun(
    workspaceId,
    'account-access',
    null,
    'openrouter',
  );
  await processJob(repository, id);
  const run = await repository.getRun(workspaceId, id);
  assert.equal(run.status, 'failed');
  assert.equal(run.brief, null);
  assert.equal(await processJob(repository, id), false);
  assert.equal(calls, 1);
});
