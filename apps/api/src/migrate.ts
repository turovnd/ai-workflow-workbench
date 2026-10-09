import { loadConfig } from '@support-desk/config';
import { createRepository } from '@support-desk/data';
import { Pool } from 'pg';
const pool = new Pool({ connectionString: loadConfig().DATABASE_URL, max: 1 });
try {
  await createRepository(pool).migrate();
  console.info('Migration and synthetic corpus seed complete.');
} finally {
  await pool.end();
}
