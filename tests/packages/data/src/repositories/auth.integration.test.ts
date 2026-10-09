import { createRepository, createSupportRepository } from '@support-desk/data';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Pool } from 'pg';
import { pool, readyRun, repo, url } from '../../helpers';
test('expired demo sessions are removed with their bounded internal effects', async () => {
  const run = await readyRun();
  await repo.approve(run.workspaceId, run.id, 'retention-test', 1);
  await pool.query(
    "UPDATE workspaces SET created_at=now()-interval '25 hours' WHERE id=$1",
    [run.workspaceId],
  );
  assert.equal(await repo.authenticate(run.token), undefined);
  await repo.cleanup();
  assert.equal(
    (
      await pool.query('SELECT count(*) FROM workspaces WHERE id=$1', [
        run.workspaceId,
      ])
    ).rows[0].count,
    '0',
  );
  assert.equal(
    (await pool.query('SELECT count(*) FROM tasks WHERE run_id=$1', [run.id]))
      .rows[0].count,
    '0',
  );
});
test('concurrent session creation completes through a single-connection pool', async () => {
  const singlePool = new Pool({
    connectionString: url,
    max: 1,
    connectionTimeoutMillis: 1000,
  });
  try {
    const sessions = await Promise.all(
      Array.from({ length: 6 }, () =>
        createRepository(singlePool).createSession(),
      ),
    );
    assert.equal(
      new Set(sessions.map((session) => session.workspaceId)).size,
      6,
    );
    assert.equal(singlePool.waitingCount, 0);
  } finally {
    await singlePool.end();
  }
});
test('independent password accounts authenticate, revoke sessions and survive anonymous retention cleanup', async () => {
  const support = createSupportRepository(pool, repo);
  const email = 'reviewer-' + Date.now() + '@example.test';
  const account = await support.register(email, 'Unique local passphrase 123!');
  assert.equal(
    (await support.authenticate(account.token))?.workspaceId,
    account.workspaceId,
  );
  await assert.rejects(support.login(email, 'incorrect passphrase'));
  const signedIn = await support.login(email, 'Unique local passphrase 123!');
  assert.equal(signedIn.workspaceId, account.workspaceId);
  assert.equal(await support.authenticate(account.token), null);
  await pool.query(
    "UPDATE workspaces SET created_at=now()-interval '25 hours' WHERE id=$1",
    [account.workspaceId],
  );
  await repo.cleanup();
  assert.equal(
    (await support.tickets(account.workspaceId, 'all', 12)).items.length,
    12,
  );
  await support.logout(signedIn.token);
  assert.equal(await support.authenticate(signedIn.token), null);
});
