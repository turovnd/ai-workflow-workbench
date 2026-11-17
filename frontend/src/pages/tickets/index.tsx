import { useSearchParams } from 'react-router-dom';
import { TicketInbox } from '@/components/tickets';
import { useAuth } from '@/hooks';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';

export const TicketsPage = () => {
  const [params, setParams] = useSearchParams();
  const status = ['open', 'resolved'].includes(params.get('status') ?? '')
    ? params.get('status')!
    : 'all';
  const auth = useAuth();
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {status === 'resolved' ? 'Resolved requests' : 'Customer requests'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Prepare a helpful reply, check its sources and approve it.
        </p>
      </div>
      {auth.session?.demo && status !== 'resolved' && (
        <Card>
          <CardHeader>
            <CardTitle>Start with an expired sign-in link</CardTitle>
            <CardDescription>
              Check what the customer already tried. Prepare a reply, open its
              sources and save your reviewed answer.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      <TicketInbox
        status={status}
        onStatus={(value) =>
          setParams(value === 'all' ? {} : { status: value })
        }
      />
    </>
  );
};
