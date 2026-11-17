import { documents } from '@support-desk/knowledge';
import { runner } from 'node-pg-migrate';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';

export const migrateDatabase = async (pool: Pool) => {
  const client = await pool.connect();
  try {
    await runner({
      dbClient: client,
      dir:
        process.env.MIGRATIONS_DIR ??
        fileURLToPath(new URL('../../migrations', import.meta.url)),
      migrationsTable: 'schema_migrations',
      direction: 'up',
      checkOrder: true,
      singleTransaction: true,
      log: () => {},
    });
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(428015)');
    await client.query(
      'UPDATE evidence SET current=false WHERE NOT(id=ANY($1::text[]))',
      [documents.map(({ id }) => id)],
    );
    for (const doc of documents) {
      await client.query(
        `
        INSERT INTO evidence(id, title, revision, section, current, text, keywords)
        VALUES($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT(id) DO UPDATE SET
          title=excluded.title, revision=excluded.revision, section=excluded.section,
          current=excluded.current, text=excluded.text, keywords=excluded.keywords
      `,
        [
          doc.id,
          doc.title,
          doc.revision,
          doc.section,
          doc.current,
          doc.text,
          doc.keywords,
        ],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
