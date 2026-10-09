import { EvidencePanel, SourceDialog } from '@/components/evidence';
import { ReplyPreparation } from '@/components/replies';
import { TicketDetails, TicketHistory } from '@/components/tickets';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useTicketWorkspace } from '@/hooks/use-ticket-workspace';
import type { Ticket } from '@support-desk/contracts';
export const TicketWorkspace = ({
  ticket,
  online,
}: {
  ticket: Ticket;
  online: boolean;
}) => {
  const state = useTicketWorkspace(ticket);
  return (
    <main id="ticket-content" className="min-w-0 overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
        <TicketDetails ticket={ticket} online={online} state={state} />
        {!online && (
          <Alert>
            <AlertTitle>You are offline</AlertTitle>
            <AlertDescription>
              Visible messages and sources remain readable. Reconnect before
              preparing or approving a reply.
            </AlertDescription>
          </Alert>
        )}
        {state.error && (
          <Alert variant="destructive">
            <AlertTitle>Could not complete the request</AlertTitle>
            <AlertDescription>{state.error.message}</AlertDescription>
          </Alert>
        )}
        <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
          <ReplyPreparation ticket={ticket} online={online} state={state} />
          <EvidencePanel state={state} />
        </div>
        <Separator />
        <TicketHistory state={state} />
      </div>
      <SourceDialog
        source={state.source}
        onClose={() => state.setSource(null)}
      />
    </main>
  );
};
