import { ConflictError, createRepository } from '@support-desk/data';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Pool } from 'pg';
import { pool, repo, url } from '../../helpers';
test('committed job survives no worker; concurrent claimers do not share a lease', async () => {
  const session = await repo.createSession();
  const id = await repo.createRun(session.workspaceId, 'billing-invoice');
  const results = await Promise.all([repo.claim(), repo.claim()]);
  const claimed = results.filter((item) => item?.run_id === id);
  assert.equal(claimed.length, 1);
  const job = claimed[0];
  assert.ok(job);
  assert.equal(
    await repo.complete(id, job.fence, await repo.compute(id)),
    true,
  );
});
test('expired lease can be recovered and a stale completion is fenced out', async () => {
  const session = await repo.createSession();
  const id = await repo.createRun(session.workspaceId, 'account-access');
  const first = await repo.claim();
  assert.ok(first);
  await pool.query(
    "UPDATE jobs SET lease_until=now()-interval '1 second' WHERE run_id=$1",
    [id],
  );
  const second = await repo.claim();
  assert.ok(second);
  assert.ok(second.fence > first.fence);
  const brief = await repo.compute(id);
  assert.equal(await repo.complete(id, first.fence, brief), false);
  assert.equal(await repo.complete(id, second.fence, brief), true);
  const events = await repo.events(session.workspaceId, id, 0);
  assert.deepEqual(
    events.map((event) => event.seq),
    events.map((_, index) => index + 1),
  );
  assert.equal(
    (await repo.getRun(session.workspaceId, id)).cursor,
    events.length,
  );
});
test('three crashed attempts become a visible terminal failure', async () => {
  const session = await repo.createSession();
  const id = await repo.createRun(session.workspaceId, 'account-access');
  for (let index = 0; index < 3; index++) {
    assert.ok(await repo.claim());
    await pool.query(
      "UPDATE jobs SET lease_until=now()-interval '1 second' WHERE run_id=$1",
      [id],
    );
  }
  assert.equal(await repo.claim(), null);
  assert.equal((await repo.getRun(session.workspaceId, id)).status, 'failed');
});
test('cancellation fences a claimed worker; evidence gap cannot be approved', async () => {
  const session = await repo.createSession();
  const id = await repo.createRun(session.workspaceId, 'retention-gap');
  const job = await repo.claim();
  assert.ok(job);
  const brief = await repo.compute(id);
  assert.equal(brief.proposal, null);
  await repo.cancel(session.workspaceId, id);
  assert.equal(await repo.complete(id, job.fence, brief), false);
  await assert.rejects(
    repo.approve(session.workspaceId, id, 'cancelled-key', 1),
    ConflictError,
  );
});
test('an exhausted job skips a run locked by cancellation instead of taking the opposite lock order', async () => {
  const session = await repo.createSession();
  const id = await repo.createRun(session.workspaceId, 'account-access');
  await pool.query(
    "UPDATE jobs SET status='leased',attempts=3,lease_until=now()-interval '1 second' WHERE run_id=$1",
    [id],
  );
  const blocker = await pool.connect();
  try {
    await blocker.query('BEGIN');
    await blocker.query('SELECT id FROM runs WHERE id=$1 FOR UPDATE', [id]);
    const limitedPool = new Pool({
      connectionString: url,
      max: 1,
      statement_timeout: 1000,
    });
    try {
      assert.equal(await createRepository(limitedPool).claim(), null);
    } finally {
      await limitedPool.end();
    }
    await blocker.query('COMMIT');
  } finally {
    await blocker.query('ROLLBACK');
    blocker.release();
  }
  await repo.cancel(session.workspaceId, id);
  assert.equal(await repo.claim(), null);
  assert.equal(
    (await repo.getRun(session.workspaceId, id)).status,
    'cancelled',
  );
});
