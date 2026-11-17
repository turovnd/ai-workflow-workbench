import type { Repository } from '@support-desk/data';
import { ProviderError } from '@support-desk/knowledge';

export const processJob = async (repository: Repository, runId?: string) => {
  const job = await repository.claim(runId);
  if (!job) return false;

  try {
    const brief = await repository.compute(job.run_id, job.fence);
    const committed = await repository.complete(job.run_id, job.fence, brief);
    console.info(
      JSON.stringify({
        event: committed ? 'job_complete' : 'job_fenced',
        runId: job.run_id,
      }),
    );
  } catch (error) {
    const retryable = error instanceof ProviderError && error.retryable;
    // Model output and provider bodies may contain customer data; never log them.
    console.error(
      JSON.stringify({
        event: retryable ? 'job_retry' : 'job_failed',
        runId: job.run_id,
      }),
    );
    if (retryable) await repository.retry(job.run_id, job.fence);
    else
      await repository.fail(
        job.run_id,
        job.fence,
        'We could not prepare a verified reply. Please try again; no response was approved.',
      );
  }
  return true;
};
