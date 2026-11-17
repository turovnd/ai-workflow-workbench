export const Path = {
  Login: '/login',
  Register: '/register',
  Tickets: '/tickets',
  Ticket: '/tickets/:ticketId',
} as const;

export const ticketPath = (id: string) =>
  `${Path.Tickets}/${encodeURIComponent(id)}`;
