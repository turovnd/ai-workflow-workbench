import { z } from 'zod';
export const ticketSchema = z.object({
  id: z.string().uuid(),
  sequence: z.string(),
  subject: z.string(),
  customer: z.string(),
  email: z.string(),
  message: z.string(),
  topic: z.string(),
  status: z.enum(['open', 'resolved']),
  createdAt: z.string(),
});
export type Ticket = z.infer<typeof ticketSchema>;
export const ticketPageSchema = z.object({
  items: z.array(ticketSchema),
  nextCursor: z.string().nullable(),
});
export const historySchema = z.object({
  id: z.string().uuid(),
  sequence: z.string(),
  kind: z.enum(['run', 'reply', 'escalation']),
  title: z.string(),
  text: z.string(),
  runId: z.string().uuid(),
  edited: z.boolean(),
  createdAt: z.string(),
});
export type HistoryItem = z.infer<typeof historySchema>;
export const historyPageSchema = z.object({
  items: z.array(historySchema),
  nextCursor: z.string().nullable(),
});
export const sessionSchema = z.object({
  token: z.string(),
  workspaceId: z.string().uuid(),
  email: z.string().nullable(),
  demo: z.boolean(),
});
export type Session = z.infer<typeof sessionSchema>;
export const draftSchema = z.object({
  approved: z.boolean().default(false),
  text: z.string().min(1).max(6000),
  version: z.number().int().positive(),
  edited: z.boolean(),
});
export type Draft = z.infer<typeof draftSchema>;
export const replyReceiptSchema = z.object({
  replyId: z.string().uuid(),
  taskId: z.string().uuid().nullable(),
  replayed: z.boolean(),
});
