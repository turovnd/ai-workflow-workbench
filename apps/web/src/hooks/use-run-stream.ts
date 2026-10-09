import { client } from '@/lib/api/client';
import type { Run } from '@support-desk/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
export const useRunStream = (run: Run | undefined) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const id = run?.id;
  const active = run?.status === 'queued' || run?.status === 'running';
  useEffect(() => {
    if (!id || !active) return;
    const controller = new AbortController();
    const cached = queryClient.getQueryData<Run>(['run', id]);
    void client
      .stream(
        id,
        cached?.cursor ?? 0,
        (event) => {
          queryClient.setQueryData<Run>(['run', id], (current) =>
            !current || event.seq <= current.cursor
              ? current
              : {
                  ...current,
                  cursor: event.seq,
                  draft:
                    event.type === 'draft'
                      ? current.draft + event.data
                      : current.draft,
                },
          );
          if (['ready', 'failed', 'cancelled'].includes(event.type))
            void queryClient.invalidateQueries({ queryKey: ['run', id] });
        },
        controller.signal,
      )
      .then(async () => {
        if (controller.signal.aborted) return;
        const final = await client.get(id);
        queryClient.setQueryData(['run', id], final);
        if (final.status === 'queued' || final.status === 'running')
          setError(
            'The connection paused. Resume to load the latest saved progress.',
          );
      })
      .catch((problem: unknown) => {
        if (!controller.signal.aborted)
          setError(
            problem instanceof Error
              ? problem.message
              : 'Connection interrupted.',
          );
      });
    return () => controller.abort();
  }, [id, active, attempt, queryClient]);
  return {
    error,
    resume: () => {
      setError(null);
      setAttempt((value) => value + 1);
    },
  };
};
