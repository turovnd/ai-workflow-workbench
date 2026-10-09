import { createApp } from '@support-desk/api';
import { createSupportRepository } from '@support-desk/data';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pool, repo } from '../../../../packages/data/helpers';
test('routes reject untrusted identity, expose CORS only to configured origins and stream persisted events over HTTP', async () => {
  const app = await createApp(repo, ['http://localhost:5173']);
  try {
    assert.equal(
      (await app.inject({ url: '/runs/00000000-0000-0000-0000-000000000000' }))
        .statusCode,
      401,
    );
    const session = await repo.createSession();
    const headers = { authorization: `Bearer ${session.token}` };
    assert.equal(
      (
        await app.inject({
          method: 'POST',
          url: '/runs',
          headers,
          payload: { caseId: 'account-access', workspaceId: 'forged' },
        })
      ).statusCode,
      400,
    );
    const response = await app.inject({
      method: 'POST',
      url: '/runs',
      headers,
      payload: { caseId: 'account-access' },
    });
    assert.equal(response.statusCode, 201);
    const id = (response.json() as { id: string }).id;
    const job = await repo.claim();
    assert.ok(job);
    await repo.complete(id, job.fence, await repo.compute(id));
    const address = await app.listen({ host: '127.0.0.1', port: 0 });
    const stream = await fetch(`${address}/runs/${id}/events?after=1`, {
      headers: { ...headers, Origin: 'http://localhost:5173' },
    });
    assert.equal(
      stream.headers.get('access-control-allow-origin'),
      'http://localhost:5173',
    );
    const content = await stream.text();
    assert.ok(content.includes('"type":"ready"'));
    assert.ok(!content.includes('id: 1\n'));
    const denied = await app.inject({
      url: `/runs/${id}`,
      headers: { ...headers, origin: 'https://untrusted.vercel.app' },
    });
    assert.equal(denied.headers['access-control-allow-origin'], undefined);
  } finally {
    await app.close();
  }
});
test('the API accepts a supported long UTF-8 draft, rejects oversized drafts and guards identity', async () => {
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
  const app = await createApp(repo, ['http://localhost:5173'], [], support);
  try {
    const headers = { authorization: `Bearer ${session.token}` };
    const text = 'Проверенный ответ. '.repeat(280);
    assert.ok(Buffer.byteLength(JSON.stringify({ text, version: 1 })) > 4096);
    assert.ok(text.length <= 6000);
    const saved = await app.inject({
      method: 'POST',
      url: `/runs/${id}/draft`,
      headers,
      payload: { text, version: 1 },
    });
    assert.equal(saved.statusCode, 200);
    assert.equal(saved.json().text, text);
    const rejected = await app.inject({
      method: 'POST',
      url: `/runs/${id}/draft`,
      headers,
      payload: { text: 'a'.repeat(6001), version: 2 },
    });
    assert.equal(rejected.statusCode, 400);
    assert.equal(
      (await app.inject({ url: '/tickets?limit=0', headers })).statusCode,
      400,
    );
    assert.equal((await app.inject({ url: '/tickets' })).statusCode, 401);
    assert.equal(
      (await app.inject({ url: '/tickets?cursor=forged', headers })).statusCode,
      400,
    );
    await support.logout(session.token);
    assert.equal(
      (await app.inject({ url: `/runs/${id}`, headers })).statusCode,
      401,
    );
  } finally {
    await app.close();
  }
});
