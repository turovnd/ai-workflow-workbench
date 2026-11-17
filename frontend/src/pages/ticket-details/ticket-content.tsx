import {
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
} from '@/components/ui';
import { EvidencePanel, SourceDialog } from '@/components/evidence';
import { ReplyPreparation } from '@/components/replies';
import { TicketDetails, TicketHistory } from '@/components/tickets';

import { useTicketWorkspace } from '@/hooks';
import type { Ticket } from '@support-desk/contracts';

export const TicketContent = ({
  ticket,
  online,
}: {
  ticket: Ticket;
  online: boolean;
}) => {
  const state = useTicketWorkspace(ticket);
  return (
    <div className="min-w-0">
      <div className="flex flex-col gap-6">
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
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
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
    </div>
  );
};
