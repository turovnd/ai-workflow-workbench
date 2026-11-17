import { jobMessage, queue } from '@support-desk/queue';
import { processJob } from '../process';
import { repository } from '../runtime';

export default queue.handleNodeCallback(
  async (message) => {
    const { runId } = jobMessage.parse(message);
    await processJob(repository, runId);
    if (await repository.isPending(runId))
      throw new Error('Job is waiting for another attempt or an active lease.');
  },
  { retry: () => ({ afterSeconds: 5 }) },
);
