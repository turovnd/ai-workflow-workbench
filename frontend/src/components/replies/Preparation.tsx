import { useEffect, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  Skeleton,
} from '@/components/ui';
import { ReplyEditor } from './Editor';

import type { TicketController } from '@/hooks';
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
  const active = running || start.isPending;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;
    const began = run?.createdAt
      ? new Date(run.createdAt).getTime()
      : Date.now();
    const timer = window.setInterval(
      () => setElapsed(Math.max(0, Math.floor((Date.now() - began) / 1000))),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [active, run?.createdAt]);

  return (
    <>
      <section
        className="flex min-w-0 flex-col gap-4"
        aria-label="Reply preparation"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-semibold">
            <MessageSquare className="size-4" />
            Reply draft
          </h2>
          {run && (
            <Badge variant="outline">
              {run.provider === 'openrouter' ? 'AI draft' : 'Sample response'}
            </Badge>
          )}
        </div>
        {!active && !run && !runQuery.isLoading && !history.isLoading && (
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
        {(runQuery.isLoading || history.isLoading) && (
          <Skeleton className="h-48 w-full" />
        )}
        {active && (
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Preparing your reply
                </span>
              </CardTitle>
              <CardDescription>
                Checking the help articles and drafting a response. This page
                updates automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p role="status" className="text-sm text-muted-foreground">
                {start.isPending
                  ? 'Submitting request…'
                  : run?.status === 'queued'
                    ? 'Waiting to start…'
                    : 'Preparing and checking the draft…'}{' '}
                · {elapsed}s
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                disabled={cancel.isPending || !run || !online}
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
            <AlertTitle>Reconnecting</AlertTitle>
            <AlertDescription>
              Live updates were interrupted. We are checking the saved result
              automatically.
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
              {!draft.data?.approved && (
                <CardDescription>{run.brief.summary}</CardDescription>
              )}
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
            {!draft.data?.approved && (
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  {run.brief.caution}
                </p>
              </CardFooter>
            )}
          </Card>
        )}
      </section>
    </>
  );
};
