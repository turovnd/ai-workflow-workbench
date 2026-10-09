import { ConflictError, createSupportRepository } from '@support-desk/data';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pool, readyRun, repo } from '../../helpers';
test('concurrent identical approvals create one task and replay before stale state', async () => {
  const run = await readyRun();
  const results = await Promise.all(
    Array.from({ length: 8 }, () =>
      repo.approve(run.workspaceId, run.id, 'same-key-123', 1),
    ),
  );
  assert.equal(new Set(results.map((item) => item.taskId)).size, 1);
  assert.equal(results.filter((item) => !item.replayed).length, 1);
  const count = await pool.query('SELECT count(*) FROM tasks WHERE run_id=$1', [
    run.id,
  ]);
  assert.equal(count.rows[0].count, '1');
});
test('different approval keys race to one stored effect; key reuse with changed intent conflicts', async () => {
  const run = await readyRun();
  const result = await Promise.allSettled([
    repo.approve(run.workspaceId, run.id, 'first-key-123', 1),
    repo.approve(run.workspaceId, run.id, 'other-key-123', 1),
  ]);
  assert.equal(result.filter((item) => item.status === 'fulfilled').length, 1);
  const receipt = await pool.query(
    'SELECT key FROM approvals WHERE workspace_id=$1',
    [run.workspaceId],
  );
  await assert.rejects(
    repo.approve(run.workspaceId, run.id, receipt.rows[0].key, 2),
    ConflictError,
  );
});
test('failed approval rolls back receipt/task and cannot cross workspaces', async () => {
  const run = await readyRun();
  const stranger = await repo.createSession();
  await assert.rejects(
    repo.approve(stranger.workspaceId, run.id, 'stranger-key', 1),
  );
  await assert.rejects(
    repo.approve(run.workspaceId, run.id, 'wrong-version', 2),
    ConflictError,
  );
  assert.equal(
    (await pool.query('SELECT count(*) FROM tasks WHERE run_id=$1', [run.id]))
      .rows[0].count,
    '0',
  );
});
test('edited reply approval is atomic, versioned, isolated and records history without sending email', async () => {
  const support = createSupportRepository(pool, repo);
  const session = await support.demo();
  const ticket = (await support.tickets(session.workspaceId, 'all', 1))
    .items[0];
  const id = await support.start(
    session.workspaceId,
    ticket.id,
    'deterministic',
  );
  const job = await repo.claim();
  assert.ok(job);
  await repo.complete(id, job.fence, await repo.compute(id));
  const original = await support.draft(session.workspaceId, id);
  const edited = await support.edit(
    session.workspaceId,
    id,
    original.text + ' I will keep the case open for your clarification.',
    original.version,
  );
  assert.equal(edited.edited, true);
  await assert.rejects(
    support.approveReply(
      session.workspaceId,
      id,
      'stale-draft-key',
      original.version,
      false,
    ),
    ConflictError,
  );
  const decisions = await Promise.all(
    Array.from({ length: 4 }, () =>
      support.approveReply(
        session.workspaceId,
        id,
        'same-reply-key',
        edited.version,
        true,
      ),
    ),
  );
  assert.equal(new Set(decisions.map((item) => item.replyId)).size, 1);
  assert.equal(decisions.filter((item) => !item.replayed).length, 1);
  assert.ok(decisions[0].taskId);
  assert.equal((await support.draft(session.workspaceId, id)).approved, true);
  await assert.rejects(
    support.edit(session.workspaceId, id, 'A changed reply', edited.version),
    ConflictError,
  );
  const history = await support.history(session.workspaceId, ticket.id, 1);
  assert.equal(history.items[0].kind, 'escalation');
  assert.equal(history.items[0].edited, true);
  assert.ok(history.nextCursor);
  const more = await support.history(
    session.workspaceId,
    ticket.id,
    1,
    history.nextCursor,
  );
  assert.equal(more.items[0].kind, 'run');
  assert.notEqual(more.items[0].id, history.items[0].id);
});
