import { queue, republishJob } from '@support-desk/queue';
import { repository } from '../runtime';

export default queue.handleNodeCallback(
  async () => {
    await repository.cleanup();
    for (const runId of await repository.recoverableJobs())
      await republishJob(runId);
  },
  { retry: () => ({ afterSeconds: 30 }) },
);
