import { client } from '@/api';
import type { Run } from '@support-desk/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export const useRunStream = (run: Run | undefined) => {
  const queryClient = useQueryClient();
  const [disconnectedRun, setDisconnectedRun] = useState<string | null>(null);
  const id = run?.id;
  const active = run?.status === 'queued' || run?.status === 'running';

  useEffect(() => {
    if (!id || !active) return;
    const controller = new AbortController();
    let reconnect: number | undefined;

    const connect = async () => {
      try {
        const cached = queryClient.getQueryData<Run>(['run', id]);
        await client.stream(
          id,
          cached?.cursor ?? 0,
          (event) => {
            if (controller.signal.aborted) return;
            setDisconnectedRun(null);
            queryClient.setQueryData<Run>(['run', id], (current) =>
              !current || event.seq <= current.cursor
                ? current
                : { ...current, cursor: event.seq },
            );
            if (['ready', 'failed', 'cancelled'].includes(event.type)) {
              void queryClient.invalidateQueries({ queryKey: ['run', id] });
            }
          },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        const final = await client.get(id, controller.signal);
        if (controller.signal.aborted) return;
        queryClient.setQueryData(['run', id], final);
        if (!['queued', 'running'].includes(final.status)) return;
      } catch {
        if (controller.signal.aborted) return;
        setDisconnectedRun(id);
      }
      reconnect = window.setTimeout(() => {
        void connect();
      }, 2000);
    };

    void connect();
    return () => {
      controller.abort();
      window.clearTimeout(reconnect);
    };
  }, [id, active, queryClient]);

  return { error: active && disconnectedRun === id };
};
