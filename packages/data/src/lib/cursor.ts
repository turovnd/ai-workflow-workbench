import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
export class CursorError extends Error {}
const schema = z
  .object({
    v: z.literal(1),
    scope: z.string().max(200),
    workspace: z.string().uuid(),
    after: z.string().regex(/^[0-9]{1,19}$/),
    ceiling: z.string().regex(/^[0-9]{1,19}$/),
  })
  .strict();
export type Cursor = z.infer<typeof schema>;
export const encodeCursor = (cursor: Cursor, secret: string) => {
  const data = Buffer.from(JSON.stringify(cursor)).toString('base64url');
  return (
    data + '.' + createHmac('sha256', secret).update(data).digest('base64url')
  );
};
export const decodeCursor = (
  value: string,
  secret: string,
  workspace: string,
  scope: string,
): Cursor => {
  try {
    if (value.length > 900) throw new Error();
    const [data, signature, ...extra] = value.split('.');
    if (extra.length || !data || !signature) throw new Error();
    const expected = createHmac('sha256', secret).update(data).digest();
    const received = Buffer.from(signature, 'base64url');
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    )
      throw new Error();
    const cursor = schema.parse(
      JSON.parse(Buffer.from(data, 'base64url').toString('utf8')),
    );
    if (
      cursor.workspace !== workspace ||
      cursor.scope !== scope ||
      BigInt(cursor.after) > BigInt(cursor.ceiling)
    )
      throw new Error();
    return cursor;
  } catch {
    throw new CursorError(
      'This page cursor is invalid or belongs to another filter. Restart the list.',
    );
  }
};
