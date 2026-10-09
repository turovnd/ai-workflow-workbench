import { createHash } from 'node:crypto';
export const digestToken = (value: string) =>
  createHash('sha256').update(value).digest('hex');
