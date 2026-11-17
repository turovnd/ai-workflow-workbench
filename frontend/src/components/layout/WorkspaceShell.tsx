import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Inbox, CircleCheck, LifeBuoy, LogOut } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Path } from '@/router/paths';
import {
  Badge,
  Button,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui';
import { RequestError } from './RequestError';

export const WorkspaceShell = () => {
  const auth = useAuth();
  const location = useLocation();
  const resolved =
    new URLSearchParams(location.search).get('status') === 'resolved';
  const details = location.pathname.startsWith('/tickets/');
  const logout = useMutation({ mutationFn: auth.signOut });

  useEffect(() => {
    document.title = `${details ? 'Ticket' : resolved ? 'Resolved' : 'Inbox'} · Support Desk`;
    document.getElementById('main-content')?.focus();
  }, [location.pathname, details, resolved]);

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:p-3"
      >
        Skip to content
      </a>
      <Sidebar
        variant="inset"
        role="complementary"
        aria-label="Workspace navigation"
      >
        <SidebarHeader>
          <Link to={Path.Tickets} className="flex items-center gap-3 px-2 py-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LifeBuoy className="size-5" />
            </span>
            <span className="font-semibold">Support Desk</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={!resolved}>
                <Link to={Path.Tickets}>
                  <Inbox />
                  <span>Inbox</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={resolved}>
                <Link to={`${Path.Tickets}?status=resolved`}>
                  <CircleCheck />
                  <span>Resolved</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-2 py-2 text-sm">
            <p className="truncate font-medium">
              {auth.session?.demo ? 'Demo workspace' : auth.session?.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {auth.session?.demo
                ? 'Your own sample requests'
                : 'Your support workspace'}
            </p>
          </div>
          <Button
            variant="outline"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOut data-icon="inline-start" />
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b px-5">
          <SidebarTrigger />
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm"
          >
            <Link
              className="text-muted-foreground hover:text-foreground"
              to={Path.Tickets}
            >
              Inbox
            </Link>
            {details && (
              <>
                <span aria-hidden="true">/</span>
                <span>Ticket details</span>
              </>
            )}
          </nav>
          {auth.session?.demo && (
            <Badge className="ml-auto" variant="secondary">
              Demo
            </Badge>
          )}
        </header>
        <div
          id="main-content"
          tabIndex={-1}
          className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-5 outline-none md:p-8 lg:p-10"
        >
          {logout.error && (
            <RequestError
              title="Couldn’t sign out"
              error={logout.error}
              retry={() => logout.mutate()}
            />
          )}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
