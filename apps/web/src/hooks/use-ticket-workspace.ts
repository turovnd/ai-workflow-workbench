import { useRunStream } from '@/hooks/use-run-stream';
import { client } from '@/lib/api/client';
import type { Citation, Ticket } from '@support-desk/contracts';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';
export const useTicketWorkspace = (ticket: Ticket) => {
  const queryClient = useQueryClient();
  const [requestedId, setRequestedId] = useState<string | null>(null);
  const [source, setSource] = useState<Citation | null>(null);
  const history = useInfiniteQuery({
    queryKey: ['history', ticket.id],
    queryFn: ({ pageParam, signal }) =>
      client.history(ticket.id, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
  const items = [
    ...new Map(
      history.data?.pages
        .flatMap((page) => page.items)
        .map((item) => [item.id, item]) ?? [],
    ).values(),
  ];
  const runId = requestedId ?? items.find((item) => item.kind === 'run')?.runId;
  const runQuery = useQuery({
    queryKey: ['run', runId],
    queryFn: () => client.get(runId!),
    enabled: !!runId,
  });
  const run = runQuery.data;
  const running = run?.status === 'queued' || run?.status === 'running';
  const draft = useQuery({
    queryKey: ['draft', runId],
    queryFn: () => client.draft(runId!),
    enabled: run?.status === 'ready',
  });
  const stream = useRunStream(run);
  const start = useMutation({
    mutationFn: () => client.start(ticket.id),
    onSuccess: async (value) => {
      setRequestedId(value.id);
      queryClient.setQueryData(['run', value.id], value);
      await queryClient.invalidateQueries({ queryKey: ['history', ticket.id] });
    },
  });
  const cancel = useMutation({
    mutationFn: () => client.cancel(runId!),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['run', runId] }),
  });
  const { fetchNextPage } = history;
  const moreHistory = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);
  const error = start.error ?? cancel.error ?? runQuery.error ?? draft.error;
  return {
    queryClient,
    requestedId,
    setRequestedId,
    source,
    setSource,
    history,
    items,
    runId,
    runQuery,
    run,
    running,
    draft,
    stream,
    start,
    cancel,
    moreHistory,
    error,
  };
};
export type TicketController = ReturnType<typeof useTicketWorkspace>;
