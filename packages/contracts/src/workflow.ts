import { z } from 'zod';

export const citationSchema = z.object({
  id: z.string(),
  title: z.string(),
  revision: z.number().int(),
  section: z.string(),
  quote: z.string(),
  text: z.string(),
});
export type Citation = z.infer<typeof citationSchema>;
export const proposalSchema = z.object({
  title: z.string(),
  owner: z.string(),
  steps: z.array(z.string()),
  version: z.number().int(),
});
export const briefSchema = z.object({
  summary: z.string(),
  reply: z.string().max(6000),
  findings: z.array(z.object({ text: z.string(), citationId: z.string() })),
  caution: z.string(),
  citations: z.array(citationSchema),
  proposal: proposalSchema.nullable(),
});
export type Brief = z.infer<typeof briefSchema>;
export const runSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  status: z.enum(['queued', 'running', 'ready', 'failed', 'cancelled']),
  brief: briefSchema.nullable(),
  draft: z.string(),
  cursor: z.number().int(),
  createdAt: z.string(),
  taskId: z.string().nullable(),
  ticketId: z.string().uuid().nullable().default(null),
  provider: z.enum(['deterministic', 'openrouter']).default('deterministic'),
});
export type Run = z.infer<typeof runSchema>;
export const eventSchema = z.object({
  seq: z.number().int().nonnegative(),
  type: z.enum(['status', 'draft', 'ready', 'failed', 'cancelled']),
  data: z.string(),
});
export type RunEvent = z.infer<typeof eventSchema>;
export const approvalSchema = z.object({
  taskId: z.string(),
  replayed: z.boolean(),
});
export type Approval = z.infer<typeof approvalSchema>;
export type ReviewCase = Readonly<{
  id: string;
  reference: string;
  title: string;
  service: string;
  category: string;
  query: string;
  description: string;
  time: string;
  priority: 'Review' | 'Investigate';
}>;
export type EvidenceDocument = Readonly<{
  id: string;
  title: string;
  revision: number;
  section: string;
  current: boolean;
  text: string;
  keywords: string;
}>;
