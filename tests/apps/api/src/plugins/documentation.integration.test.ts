import { createApp } from '@support-desk/api';
import { createSupportRepository } from '@support-desk/data';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pool, repo } from '../../../../packages/data/helpers';

test('OpenAPI covers the production surface, exposes correct auth and serves Swagger assets locally', async () => {
  const app = await createApp(
    repo,
    [],
    [],
    createSupportRepository(pool, repo),
  );
  try {
    const response = await app.inject('/openapi.json');
    assert.equal(response.statusCode, 200);
    const spec = response.json();
    assert.equal(spec.openapi, '3.1.0');
    const expected = [
      'GET /health',
      'GET /capabilities',
      'POST /auth/demo',
      'POST /auth/register',
      'POST /auth/login',
      'GET /auth/me',
      'POST /auth/logout',
      'GET /tickets',
      'GET /tickets/{id}',
      'GET /tickets/{id}/history',
      'POST /tickets/{id}/runs',
      'GET /runs/{id}',
      'GET /runs/{id}/events',
      'POST /runs/{id}/cancel',
      'GET /runs/{id}/draft',
      'POST /runs/{id}/draft',
      'POST /runs/{id}/reply',
    ];
    const actual = Object.entries(spec.paths).flatMap(([path, operations]) =>
      Object.keys(operations as object).map(
        (method) => `${method.toUpperCase()} ${path}`,
      ),
    );
    assert.deepEqual(actual.sort(), expected.sort());
    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const operation of Object.values(
        methods as Record<
          string,
          {
            summary: string;
            responses: Record<string, unknown>;
            security: unknown;
          }
        >,
      )) {
        assert.ok(operation.summary);
        assert.ok(operation.responses['400']);
        const isPublic = [
          '/health',
          '/capabilities',
          '/auth/demo',
          '/auth/register',
          '/auth/login',
        ].includes(path);
        assert.deepEqual(operation.security, isPublic ? [] : [{ session: [] }]);
      }
    }
    assert.ok(
      spec.paths['/runs/{id}/events'].get.responses['200'].content[
        'text/event-stream'
      ],
    );
    const limit = spec.paths['/tickets'].get.parameters.find(
      (p: { name: string }) => p.name === 'limit',
    );
    assert.equal(limit.example, '12');
    assert.match(
      spec.paths['/tickets'].get.description,
      /workspace and status filter/,
    );
    assert.ok(
      spec.paths['/auth/register'].post.requestBody.content['application/json']
        .schema,
    );
    const ui = await app.inject('/docs/');
    assert.equal(ui.statusCode, 200);
    assert.match(ui.body, /\.\/static\/swagger-ui-bundle\.js/);
    assert.doesNotMatch(ui.body, /https?:\/\/.*(?:unpkg|jsdelivr)/);
    const asset = await app.inject('/docs/static/swagger-ui-bundle.js');
    assert.equal(asset.statusCode, 200);
    assert.ok(asset.body.length > 10000);
    const initializer = await app.inject('/docs/static/swagger-initializer.js');
    assert.equal(initializer.statusCode, 200);
    assert.match(initializer.body, /validatorUrl: null/);
    assert.equal((await app.inject('/tickets')).statusCode, 401);
  } finally {
    await app.close();
  }
});
