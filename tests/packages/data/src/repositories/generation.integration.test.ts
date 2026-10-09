import {
  ConflictError,
  createRepository,
  createSupportRepository,
} from '@support-desk/data';
import { buildBrief } from '@support-desk/knowledge';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pool } from '../../helpers';
test('persistent global admission budget bounds live attempts across fresh workspaces', async () => {
  await pool.query("UPDATE provider_budget SET used=0 WHERE id='openrouter'");
  let calls = 0;
  const live = createRepository(
    pool,
    async (ticket, evidence) => {
      calls++;
      return buildBrief(ticket, evidence);
    },
    2,
  );
  for (let index = 0; index < 3; index++) {
    const support = createSupportRepository(pool, live);
    const session = await support.demo();
    const ticket = (await support.tickets(session.workspaceId, 'all', 1))
      .items[0];
    const id = await support.start(
      session.workspaceId,
      ticket.id,
      'openrouter',
    );
    const job = await live.claim();
    assert.ok(job);
    if (index < 2) {
      const brief = await live.compute(id, job.fence);
      await assert.rejects(live.compute(id, job.fence), ConflictError);
      await live.complete(id, job.fence, brief);
    } else {
      await assert.rejects(live.compute(id, job.fence), ConflictError);
      await live.fail(id, job.fence, 'Live budget exhausted.');
    }
  }
  assert.equal(calls, 2);
  assert.equal(
    (await pool.query("SELECT used FROM provider_budget WHERE id='openrouter'"))
      .rows[0].used,
    2,
  );
});
