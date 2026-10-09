import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import type { Ticket } from '@support-desk/contracts';
import { LoaderCircle, Sparkles, UserRound } from 'lucide-react';
export const TicketDetails = ({
  ticket,
  online,
  state,
}: {
  ticket: Ticket;
  online: boolean;
  state: TicketController;
}) => {
  const { run, running, start } = state;
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Ticket #{ticket.sequence}</Badge>
            <Badge variant="secondary">
              {ticket.topic === 'retention-gap'
                ? 'Policy question'
                : ticket.topic === 'account-access'
                  ? 'Account access'
                  : 'Billing'}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {ticket.subject}
          </h1>
        </div>
        <Button
          disabled={running || start.isPending || !online}
          onClick={() => start.mutate()}
        >
          {start.isPending ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Sparkles data-icon="inline-start" />
          )}
          {run ? 'Prepare another reply' : 'Prepare reply'}
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar aria-hidden="true">
              <AvatarFallback>
                <UserRound className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{ticket.customer}</CardTitle>
              <CardDescription>
                {ticket.email} · Synthetic customer
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{ticket.message}</p>
        </CardContent>
        <CardFooter>
          <span className="text-xs text-muted-foreground">
            Received {new Date(ticket.createdAt).toLocaleDateString('en-GB')} ·
            Email channel preview
          </span>
        </CardFooter>
      </Card>
    </>
  );
};
