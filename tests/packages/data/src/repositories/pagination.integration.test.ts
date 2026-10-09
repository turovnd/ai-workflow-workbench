import { createSupportRepository, CursorError } from '@support-desk/data';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pool, repo } from '../../helpers';
test('keyset pages have no overlap, reject cross-workspace/filter/tampered cursors and exclude later inserts', async () => {
  const support = createSupportRepository(pool, repo);
  const session = await support.demo();
  const first = await support.tickets(session.workspaceId, 'all', 7);
  assert.equal(first.items.length, 7);
  assert.ok(first.nextCursor);
  const last = first.items[0];
  await pool.query(
    'INSERT INTO tickets(id,workspace_id,subject,customer,email,message,topic) VALUES(gen_random_uuid(),$1,$2,$3,$4,$5,$6)',
    [
      session.workspaceId,
      'New arrival',
      'New customer',
      'new@example.test',
      'new message',
      'account-access',
    ],
  );
  const all = [...first.items];
  let cursor: string | null = first.nextCursor;
  while (cursor) {
    const next = await support.tickets(session.workspaceId, 'all', 7, cursor);
    all.push(...next.items);
    cursor = next.nextCursor;
  }
  assert.equal(all.length, 36);
  assert.equal(new Set(all.map((ticket) => ticket.id)).size, 36);
  assert.ok(
    all.every((ticket) => BigInt(ticket.sequence) <= BigInt(last.sequence)),
  );
  await assert.rejects(
    support.tickets(session.workspaceId, 'open', 7, first.nextCursor),
    CursorError,
  );
  const other = await support.demo();
  await assert.rejects(
    support.tickets(other.workspaceId, 'all', 7, first.nextCursor),
    CursorError,
  );
  await assert.rejects(
    support.tickets(session.workspaceId, 'all', 7, first.nextCursor + 'broken'),
    CursorError,
  );
  await assert.rejects(support.getTicket(other.workspaceId, last.id));
  const open = await support.tickets(session.workspaceId, 'open', 7);
  await pool.query("UPDATE tickets SET status='resolved' WHERE id=$1", [
    all[12].id,
  ]);
  const remaining = await support.tickets(
    session.workspaceId,
    'open',
    50,
    open.nextCursor!,
  );
  assert.ok(!remaining.items.some((ticket) => ticket.id === all[12].id));
  const refreshed = await support.tickets(session.workspaceId, 'resolved', 50);
  assert.deepEqual(
    refreshed.items.map((ticket) => ticket.id),
    [all[12].id],
  );
});
test('ticket keyset traversal preserves numeric order across 9/10 and 99/100', async () => {
  const session = await resetBoundaryFixture();
  await pool.query(
    "INSERT INTO tickets(id,workspace_id,subject,customer,email,message,topic) SELECT gen_random_uuid(),$1,'Question '||g,'Synthetic customer','customer@example.test','Sign-in link expired','account-access' FROM generate_series(1,120) g",
    [session.workspaceId],
  );
  const support = createSupportRepository(pool, repo);
  await assertNumericTraversal((cursor) =>
    support.tickets(session.workspaceId, 'all', 7, cursor),
  );
  await assertNumericTraversal((cursor) =>
    support.tickets(session.workspaceId, 'open', 12, cursor),
  );
});
test('history keyset traversal preserves numeric order across 9/10 and 99/100', async () => {
  const session = await resetBoundaryFixture();
  const ticket = await pool.query(
    "INSERT INTO tickets(id,workspace_id,subject,customer,email,message,topic) VALUES(gen_random_uuid(),$1,'Question','Synthetic customer','customer@example.test','Sign-in link expired','account-access') RETURNING id",
    [session.workspaceId],
  );
  const run = await repo.createRun(session.workspaceId, 'account-access');
  await pool.query(
    "INSERT INTO history(id,workspace_id,ticket_id,run_id,kind,title,text) SELECT gen_random_uuid(),$1,$2,$3,'run','Preparation '||g,'Synthetic history entry' FROM generate_series(1,120) g",
    [session.workspaceId, ticket.rows[0].id, run],
  );
  const support = createSupportRepository(pool, repo);
  await assertNumericTraversal((cursor) =>
    support.history(session.workspaceId, ticket.rows[0].id, 7, cursor),
  );
  await assertNumericTraversal((cursor) =>
    support.history(session.workspaceId, ticket.rows[0].id, 12, cursor),
  );
});
const resetBoundaryFixture = async () => {
  await pool.query(
    'TRUNCATE approvals,tasks,events,jobs,runs,workspaces RESTART IDENTITY CASCADE',
  );
  return repo.createSession();
};
const assertNumericTraversal = async (
  page: (
    cursor?: string,
  ) => Promise<{ items: { sequence: string }[]; nextCursor: string | null }>,
) => {
  let cursor: string | undefined;
  const sequences: string[] = [];
  for (let index = 0; index < 50; index++) {
    const result = await page(cursor);
    sequences.push(...result.items.map((item) => item.sequence));
    if (!result.nextCursor) break;
    cursor = result.nextCursor;
  }
  assert.deepEqual(
    sequences,
    Array.from({ length: 120 }, (_, index) => String(120 - index)),
  );
  assert.equal(new Set(sequences).size, 120);
};
