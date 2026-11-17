import { writeFile } from 'node:fs/promises';
import { Pool } from 'pg';
import { createRepository, createSupportRepository } from '@support-desk/data';
import { createApp } from '../modules/api/app';

const pool = new Pool({
  connectionString: 'postgresql://schema:schema@127.0.0.1:1/schema',
});

const repository = createRepository(pool);

const app = await createApp(
  repository,
  [],
  [],
  createSupportRepository(pool, repository),
);
try {
  await app.ready();
  await writeFile(
    process.argv[2],
    JSON.stringify(app.swagger(), null, 2) + '\n',
  );
} finally {
  await app.close();
  await pool.end();
}
