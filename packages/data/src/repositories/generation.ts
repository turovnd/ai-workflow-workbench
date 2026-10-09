import type { EvidenceDocument } from '@support-desk/contracts';
import { buildBrief, cases } from '@support-desk/knowledge';
import { randomUUID } from 'node:crypto';
import type { DataContext } from '../context';
import { ConflictError, NotFoundError } from '../lib/errors';
export const createGenerationRepository = ({
  pool,
  transaction,
  generate,
  liveCallBudget,
}: DataContext) => ({
  compute: async (runId: string, fence?: number) => {
    const { rows } = await pool.query<{
      case_id: string;
      provider: string;
      message: string | null;
    }>(
      'SELECT r.case_id,r.provider,t.message FROM runs r LEFT JOIN tickets t ON t.id=r.ticket_id WHERE r.id=$1',
      [runId],
    );
    const reviewCase = cases.find((item) => item.id === rows[0]?.case_id);
    if (!reviewCase) throw new NotFoundError('Case not found.');
    const query = reviewCase.query.split(' ').join(' | ');
    const evidence = await pool.query<EvidenceDocument>(
      "SELECT id,title,revision,section,current,text,keywords FROM evidence WHERE current AND search @@ to_tsquery('english',$1) ORDER BY ts_rank_cd(search,to_tsquery('english',$1)) DESC,id LIMIT 4",
      [query],
    );
    if (rows[0].provider === 'openrouter') {
      if (!generate) throw new Error('Live generation is not configured.');
      if (evidence.rows.length)
        await transaction(async (client) => {
          await client.query('SELECT id FROM runs WHERE id=$1 FOR UPDATE', [
            runId,
          ]);
          const leased = await client.query(
            "SELECT 1 FROM jobs j JOIN runs r ON r.id=j.run_id WHERE j.run_id=$1 AND j.fence=$2 AND j.status='leased' AND j.lease_until>now() AND r.status='running'",
            [runId, fence ?? -1],
          );
          if (!leased.rowCount)
            throw new ConflictError('The live job lease is no longer valid.');
          const previous = await client.query(
            'SELECT 1 FROM provider_attempts WHERE run_id=$1 AND fence=$2',
            [runId, fence],
          );
          if (previous.rowCount)
            throw new ConflictError(
              'This lease has already reserved a live provider attempt.',
            );
          const reserved = await client.query(
            "UPDATE provider_budget SET used=used+1 WHERE id='openrouter' AND used<$1 RETURNING used",
            [liveCallBudget],
          );
          if (!reserved.rowCount)
            throw new ConflictError(
              'The global live provider call budget is exhausted.',
            );
          await client.query(
            'INSERT INTO provider_attempts(id,run_id,fence) VALUES($1,$2,$3)',
            [randomUUID(), runId, fence],
          );
        });
      return generate(
        {
          ...reviewCase,
          description: rows[0].message ?? reviewCase.description,
        },
        evidence.rows,
      );
    }
    return buildBrief(reviewCase, evidence.rows);
  },
});
