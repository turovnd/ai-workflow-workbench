import { createRepository } from '@support-desk/data';
import assert from 'node:assert/strict';
import { after, before } from 'node:test';
import { Pool } from 'pg';
export const url = process.env.TEST_DATABASE_URL;
if (!url)
  throw new Error(
    'Set TEST_DATABASE_URL to an isolated PostgreSQL test database.',
  );
export const pool = new Pool({ connectionString: url, max: 12 });
export const repo = createRepository(pool);
before(async () => {
  await repo.migrate();
  await pool.query(
    'TRUNCATE approvals,tasks,events,jobs,runs,workspaces CASCADE',
  );
});
after(async () => pool.end());
export const readyRun = async () => {
  const session = await repo.createSession();
  const id = await repo.createRun(session.workspaceId, 'account-access');
  const job = await repo.claim();
  assert.ok(job);
  assert.equal(job.run_id, id);
  assert.equal(
    await repo.complete(id, job.fence, await repo.compute(id)),
    true,
  );
  return { ...session, id };
};
