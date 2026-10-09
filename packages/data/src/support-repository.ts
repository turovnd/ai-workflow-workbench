import type { Pool } from 'pg';
import { createAuthRepository } from './repositories/auth';
import { createDraftsRepository } from './repositories/drafts';
import { createHistoryRepository } from './repositories/history';
import { createReplyApprovalsRepository } from './repositories/reply-approvals';
import { createTicketsRepository } from './repositories/tickets';
import type { Repository } from './repository';
import { createSupportContext } from './support-context';
export const createSupportRepository = (pool: Pool, core: Repository) => {
  const context = createSupportContext(pool, core);
  return {
    ...createAuthRepository(context),
    ...createTicketsRepository(context),
    ...createHistoryRepository(context),
    ...createDraftsRepository(context),
    ...createReplyApprovalsRepository(context),
  };
};
export type SupportRepository = ReturnType<typeof createSupportRepository>;
