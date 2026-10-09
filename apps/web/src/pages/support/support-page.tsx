import { WorkspaceHeader } from '@/components/layout/workspace-header';
import { TicketInbox } from '@/components/tickets';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { client, readSession, saveSession } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { AuthScreen } from '@/pages/auth';
import { TicketWorkspace } from '@/pages/support/ticket-page';
import type { Session, Ticket } from '@support-desk/contracts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
export const SupportPage = () => {
  const [session, setSession] = useState<Session | null>(readSession);
  const [selectedId, setSelectedId] = useState<string | null>(
    new URLSearchParams(location.search).get('ticket'),
  );
  const selectedQuery = useQuery({
    queryKey: ['ticket', selectedId],
    queryFn: () => client.ticket(selectedId!),
    enabled: !!session && !!selectedId,
  });
  const selected = selectedQuery.data;
  const [online, setOnline] = useState(navigator.onLine);
  const [showInbox, setShowInbox] = useState(true);
  const [status, setStatus] = useState(
    new URLSearchParams(location.search).get('status') ?? 'all',
  );
  const queryClient = useQueryClient();
  const me = useQuery({
    queryKey: ['identity', session?.workspaceId],
    queryFn: client.me,
    enabled: !!session,
    retry: false,
  });
  const capabilities = useQuery({
    queryKey: ['capabilities'],
    queryFn: client.capabilities,
  });
  const clear = () => {
    saveSession(null);
    setSession(null);
    setSelectedId(null);
    history.replaceState({}, '', location.pathname);
    queryClient.clear();
  };
  const logout = useMutation({
    mutationFn: client.logout,
    onSuccess: (current) => {
      if (current) clear();
    },
  });
  useEffect(() => {
    const expired = () => {
      saveSession(null);
      setSession(null);
      setSelectedId(null);
      history.replaceState({}, '', location.pathname);
      queryClient.clear();
    };
    const network = () => setOnline(navigator.onLine);
    window.addEventListener('support-session-expired', expired);
    window.addEventListener('online', network);
    window.addEventListener('offline', network);
    return () => {
      window.removeEventListener('support-session-expired', expired);
      window.removeEventListener('online', network);
      window.removeEventListener('offline', network);
    };
  }, [queryClient]);
  const authenticated = (value: Session) => {
    queryClient.clear();
    saveSession(value);
    setSelectedId(null);
    history.replaceState({}, '', location.pathname);
    setSession(value);
  };
  if (!session) return <AuthScreen onSession={authenticated} />;
  if (me.isLoading)
    return (
      <main
        className="mx-auto flex max-w-lg flex-col gap-4 p-8"
        aria-label="Restoring session"
      >
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-48 w-full" />
      </main>
    );
  const select = (ticket: Ticket) => {
    setSelectedId(ticket.id);
    queryClient.setQueryData(['ticket', ticket.id], ticket);
    setShowInbox(false);
    const url = new URL(location.href);
    url.searchParams.set('ticket', ticket.id);
    history.replaceState({}, '', url);
  };
  const filter = (value: string) => {
    setStatus(value);
    setSelectedId(null);
    queryClient.removeQueries({ queryKey: ['tickets', value] });
    const url = new URL(location.href);
    url.searchParams.set('status', value);
    url.searchParams.delete('ticket');
    history.replaceState({}, '', url);
  };
  return (
    <div className="flex h-screen min-h-[600px] flex-col">
      <a href="#ticket-content" className="sr-only focus:not-sr-only focus:p-3">
        Skip to ticket
      </a>
      <WorkspaceHeader
        session={session}
        showInbox={showInbox}
        onToggle={() => setShowInbox(!showInbox)}
        mode={capabilities.data?.generationMode}
        onLogout={() => logout.mutate()}
        loggingOut={logout.isPending}
      />
      {logout.error && (
        <Alert variant="destructive">
          <AlertTitle>Sign-out failed</AlertTitle>
          <AlertDescription>
            {logout.error.message} Retry to revoke your session.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid min-h-0 flex-1 md:grid-cols-[320px_minmax(0,1fr)]">
        <div
          className={cn(
            'min-h-0 flex-col md:flex',
            showInbox ? 'flex' : 'hidden',
          )}
        >
          <TicketInbox
            status={
              ['all', 'open', 'resolved'].includes(status) ? status : 'all'
            }
            onStatus={filter}
            selectedId={selectedId}
            onSelect={select}
          />
        </div>
        <div
          className={cn(
            'min-h-0 flex-col md:flex',
            showInbox ? 'hidden' : 'flex',
          )}
        >
          {selected ? (
            <TicketWorkspace
              key={selected.id}
              ticket={selected}
              online={online}
            />
          ) : (
            <Empty id="ticket-content">
              <EmptyHeader>
                <EmptyTitle>Select a customer request</EmptyTitle>
                <EmptyDescription>
                  Choose a ticket from the inbox to prepare a reply, inspect its
                  sources and record your decision.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
};
