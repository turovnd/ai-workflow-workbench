import type { ReplyGenerator } from '@support-desk/knowledge';
import type { Pool } from 'pg';
import { createDataContext } from './context';
import { createGenerationRepository } from './repositories/generation';
import { createJobsRepository } from './repositories/jobs';
import { createLifecycleRepository } from './repositories/lifecycle';
import { createRunsRepository } from './repositories/runs';
import { createTaskApprovalsRepository } from './repositories/task-approvals';
export const createRepository = (
  pool: Pool,
  generate?: ReplyGenerator,
  liveCallBudget = 0,
) => {
  const context = createDataContext(pool, generate, liveCallBudget);
  return {
    ...createLifecycleRepository(context),
    ...createRunsRepository(context),
    ...createJobsRepository(context),
    ...createGenerationRepository(context),
    ...createTaskApprovalsRepository(context),
  };
};
export type Repository = ReturnType<typeof createRepository>;
