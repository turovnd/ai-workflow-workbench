import { LoadMore } from '@/components/pagination/load-more';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TicketController } from '@/hooks/use-ticket-workspace';
import { CheckCheck, History, RotateCcw } from 'lucide-react';
export const TicketHistory = ({ state }: { state: TicketController }) => {
  const { queryClient, setRequestedId, history, items, moreHistory } = state;
  return (
    <>
      <section aria-label="Ticket history" className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <History className="size-4" />
          Ticket history
        </h2>
        {history.error && (
          <Alert variant="destructive">
            <AlertTitle>History could not load</AlertTitle>
            <AlertDescription>
              {history.error.message}
              <Button
                variant="outline"
                onClick={() => {
                  void history.refetch();
                }}
              >
                Retry history
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {!items.length && !history.isLoading && (
          <p className="text-sm text-muted-foreground">
            Prepared drafts, approvals and internal escalations will be recorded
            here.
          </p>
        )}
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>{item.title}</CardTitle>
                <Badge variant="outline">
                  {item.edited ? 'Edited reply' : item.kind}
                </Badge>
              </div>
              <CardDescription>
                {new Date(item.createdAt).toLocaleString('en-GB')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {item.text}
              </p>
            </CardContent>
            {item.kind === 'run' && (
              <CardFooter>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRequestedId(item.runId);
                    void queryClient.invalidateQueries({
                      queryKey: ['run', item.runId],
                    });
                  }}
                >
                  <RotateCcw data-icon="inline-start" />
                  Open saved preparation
                </Button>
              </CardFooter>
            )}
            {item.kind !== 'run' && (
              <CardFooter>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCheck className="size-3" />
                  Saved internally · No email sent
                </span>
              </CardFooter>
            )}
          </Card>
        ))}
        <LoadMore
          hasMore={!!history.hasNextPage}
          pending={history.isFetchingNextPage}
          onLoad={moreHistory}
          disabled={!!history.error}
        />
      </section>
    </>
  );
};
