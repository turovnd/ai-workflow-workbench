import { ReplyEditor } from '@/components/replies/reply-editor';
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import type { TicketController } from '@/hooks/use-ticket-workspace';
import type { Ticket } from '@support-desk/contracts';
import { LoaderCircle, MessageSquare, Sparkles, Square } from 'lucide-react';
export const ReplyPreparation = ({
  ticket,
  online,
  state,
}: {
  ticket: Ticket;
  online: boolean;
  state: TicketController;
}) => {
  const { history, runQuery, run, running, draft, stream, start, cancel } =
    state;
  return (
    <>
      <section
        className="flex min-w-0 flex-col gap-4"
        aria-label="Reply preparation"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <MessageSquare className="size-4" />
            Suggested response
          </h2>
          {run && (
            <Badge variant="outline">
              {run.provider === 'openrouter'
                ? 'AI draft'
                : 'Deterministic demo'}
            </Badge>
          )}
        </div>
        {!run && !runQuery.isLoading && !history.isLoading && (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>Start with a grounded draft</EmptyTitle>
              <EmptyDescription>
                Prepare a reply from the current help articles, review its
                sources, then edit and approve it.
              </EmptyDescription>
            </EmptyHeader>
            <Button
              disabled={!online || start.isPending}
              onClick={() => start.mutate()}
            >
              <Sparkles data-icon="inline-start" />
              Prepare reply
            </Button>
          </Empty>
        )}
        {(runQuery.isLoading || history.isLoading || start.isPending) && (
          <Skeleton className="h-48 w-full" />
        )}
        {running && (
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Preparing your reply
                </span>
              </CardTitle>
              <CardDescription>
                Retrieving current articles and checking the response before it
                becomes available for review.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                variant="outline"
                disabled={cancel.isPending}
                onClick={() => cancel.mutate()}
              >
                <Square data-icon="inline-start" />
                Cancel preparation
              </Button>
            </CardFooter>
          </Card>
        )}
        {stream.error && running && (
          <Alert variant="destructive">
            <AlertTitle>Connection paused</AlertTitle>
            <AlertDescription>
              {stream.error}
              <Button variant="outline" onClick={stream.resume}>
                Resume preparation
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {run?.status === 'failed' && (
          <Alert variant="destructive">
            <AlertTitle>The reply could not be prepared</AlertTitle>
            <AlertDescription>
              No unvalidated response can be approved. Review the sources and
              prepare another reply to retry.
            </AlertDescription>
          </Alert>
        )}
        {run?.status === 'cancelled' && (
          <Alert>
            <AlertTitle>Preparation cancelled</AlertTitle>
            <AlertDescription>
              No reply or task was saved. You can prepare another reply.
            </AlertDescription>
          </Alert>
        )}
        {run?.brief && run.status === 'ready' && (
          <Card>
            <CardHeader>
              <CardTitle>
                {draft.data?.approved
                  ? 'Approved response'
                  : run.brief.citations.length
                    ? 'Ready for your review'
                    : 'Clarification needed'}
              </CardTitle>
              <CardDescription>{run.brief.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {!run.brief.citations.length && (
                <Alert>
                  <AlertTitle>
                    The help articles do not answer this question
                  </AlertTitle>
                  <AlertDescription>
                    The draft asks for clarification and avoids making an
                    unsupported policy promise.
                  </AlertDescription>
                </Alert>
              )}
              {draft.data ? (
                <ReplyEditor
                  key={run.id}
                  runId={run.id}
                  ticketId={ticket.id}
                  draft={draft.data}
                  online={online}
                />
              ) : (
                <Skeleton className="h-48 w-full" />
              )}
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                {draft.data?.approved
                  ? 'This response was approved by a reviewer and saved. No email was sent.'
                  : run.brief.caution}
              </p>
            </CardFooter>
          </Card>
        )}
      </section>
    </>
  );
};
