import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { WorkspaceShell } from '@/components/layout';
import { Path } from './paths';
import { ProtectedWorkspace } from './protected-workspace';

const TicketsPage = lazy(() =>
  import('@/pages/tickets').then((page) => ({ default: page.TicketsPage })),
);

const TicketPage = lazy(() =>
  import('@/pages/ticket-details').then((page) => ({
    default: page.TicketPage,
  })),
);

export const mainRoutes: RouteObject[] = [
  {
    element: <ProtectedWorkspace />,
    children: [
      {
        element: <WorkspaceShell />,
        children: [
          { path: '/', element: <Navigate to={Path.Tickets} replace /> },
          { path: Path.Tickets, element: <TicketsPage /> },
          { path: Path.Ticket, element: <TicketPage /> },
        ],
      },
    ],
  },
];
