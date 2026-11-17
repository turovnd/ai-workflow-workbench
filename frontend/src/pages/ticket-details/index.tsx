import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { client } from '@/api';
import { Path } from '@/router/paths';
import { PageLoading, RequestError } from '@/components/layout';
import { useOnline } from '@/hooks';
import { TicketContent } from './ticket-content';

export const TicketPage = () => {
  const { ticketId } = useParams();
  const online = useOnline();
  const ticket = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => client.ticket(ticketId!),
    enabled: !!ticketId,
  });
  return (
    <>
      <Link
        to={Path.Tickets}
        className="flex w-fit items-center gap-2 text-sm font-medium hover:underline"
      >
        <ArrowLeft className="size-4" />
        Back to inbox
      </Link>
      {ticket.isPending ? (
        <PageLoading label="Loading customer request" />
      ) : ticket.error ? (
        <RequestError
          title="Couldn’t load this request"
          error={ticket.error}
          retry={() => {
            void ticket.refetch();
          }}
        />
      ) : (
        <TicketContent
          key={ticket.data.id}
          ticket={ticket.data}
          online={online}
        />
      )}
    </>
  );
};
