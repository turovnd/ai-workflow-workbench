import { migrateDatabase } from '@support-desk/data/migrations';
import { loadConfig } from '@support-desk/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: loadConfig().DATABASE_URL, max: 1 });
try {
  await migrateDatabase(pool);
  console.info('Migration and synthetic corpus seed complete.');
} finally {
  await pool.end();
}
