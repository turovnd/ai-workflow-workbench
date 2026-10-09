import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { client } from '@/lib/api/client';
import type { Ticket } from '@support-desk/contracts';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Inbox, RefreshCw } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { LoadMore } from '../pagination/load-more';
export const TicketInbox = ({
  status,
  onStatus,
  selectedId,
  onSelect,
}: {
  status: string;
  onStatus: (status: string) => void;
  selectedId: string | null;
  onSelect: (ticket: Ticket) => void;
}) => {
  const list = useInfiniteQuery({
    queryKey: ['tickets', status],
    queryFn: ({ pageParam, signal }) =>
      client.tickets(status, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
    retry: 1,
  });
  const tickets = [
    ...new Map(
      list.data?.pages
        .flatMap((page) => page.items)
        .map((ticket) => [ticket.id, ticket]) ?? [],
    ).values(),
  ];
  useEffect(() => {
    const first = list.data?.pages[0]?.items[0];
    if (!selectedId && first) onSelect(first);
  }, [list.data, selectedId, onSelect]);
  const { fetchNextPage } = list;
  const more = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);
  return (
    <aside
      className="flex h-full min-h-0 flex-col border-r"
      aria-label="Support inbox"
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Inbox className="size-4" />
          <h2 className="font-semibold">Inbox</h2>
          <Badge variant="secondary">{tickets.length} loaded</Badge>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Refresh inbox"
          onClick={() => {
            void list.refetch();
          }}
        >
          <RefreshCw />
        </Button>
      </div>
      <Tabs
        value={status}
        onValueChange={onStatus}
        className="min-h-0 flex-1 gap-3"
      >
        <TabsList className="mx-4 self-stretch">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>
        <TabsContent
          value={status}
          className="min-h-0 overflow-y-auto"
          aria-label="Ticket list"
        >
          {list.isLoading && (
            <div className="flex flex-col gap-4 p-4">
              {[1, 2, 3].map((value) => (
                <Skeleton key={value} className="h-24 w-full" />
              ))}
            </div>
          )}
          {list.error && (
            <div className="p-4">
              <Alert variant="destructive">
                <AlertTitle>Inbox unavailable</AlertTitle>
                <AlertDescription>
                  {list.error.message}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void list.refetch();
                    }}
                  >
                    Retry inbox
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}
          {!list.isLoading && !tickets.length && !list.error && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox />
                </EmptyMedia>
                <EmptyTitle>No tickets in this view</EmptyTitle>
                <EmptyDescription>
                  Choose another status or refresh the inbox.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
          <div className="flex flex-col gap-1 px-2">
            {tickets.map((ticket) => (
              <Button
                key={ticket.id}
                variant={ticket.id === selectedId ? 'secondary' : 'ghost'}
                className="h-auto w-full justify-start whitespace-normal p-3 text-left"
                aria-current={ticket.id === selectedId ? 'page' : undefined}
                onClick={() => onSelect(ticket)}
              >
                <div className="flex w-full min-w-0 flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span>{ticket.customer}</span>
                    <Badge
                      variant={
                        ticket.status === 'resolved' ? 'secondary' : 'outline'
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <span className="block truncate">{ticket.subject}</span>
                  <span className="line-clamp-2 text-xs font-normal">
                    {ticket.message}
                  </span>
                  <span className="text-xs font-normal">
                    Ticket #{ticket.sequence}
                  </span>
                </div>
              </Button>
            ))}
          </div>
          <LoadMore
            hasMore={!!list.hasNextPage}
            pending={list.isFetchingNextPage}
            onLoad={more}
            disabled={!!list.error}
          />
          {tickets.length > 0 && !list.hasNextPage && (
            <p className="p-4 text-center text-xs text-muted-foreground">
              You have reached the end of this view.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
};
