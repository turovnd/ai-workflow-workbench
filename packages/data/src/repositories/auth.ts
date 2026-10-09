import { randomUUID } from 'node:crypto';
import { AuthenticationError, ConflictError } from '../lib/errors';
import { digestToken as hash } from '../lib/hash';
import {
  dummyPasswordHash,
  hashPassword,
  verifyPassword,
} from '../lib/password';
import type { SupportContext } from '../support-context';
export const createAuthRepository = ({
  pool,
  transaction,
  session,
  createWorkspace,
}: SupportContext) => ({
  demo: () =>
    transaction(async (client) => {
      const workspace = await createWorkspace(client, true);
      return session(client, workspace, null, true);
    }),
  register: async (email: string, password: string) => {
    const passwordHash = await hashPassword(password);
    return transaction(async (client) => {
      const exists = await client.query(
        'SELECT 1 FROM accounts WHERE email=$1',
        [email],
      );
      if (exists.rowCount)
        throw new ConflictError(
          'Unable to create this account. Try signing in.',
        );
      const workspace = await createWorkspace(client, false);
      await client.query(
        'INSERT INTO accounts(id,workspace_id,email,password_hash) VALUES($1,$2,$3,$4)',
        [randomUUID(), workspace, email, passwordHash],
      );
      return session(client, workspace, email, false);
    });
  },
  login: async (email: string, password: string) => {
    const { rows } = await pool.query<{
      workspace_id: string;
      password_hash: string;
    }>('SELECT workspace_id,password_hash FROM accounts WHERE email=$1', [
      email,
    ]);
    const valid = await verifyPassword(
      password,
      rows[0]?.password_hash ?? dummyPasswordHash,
    );
    if (!valid || !rows[0])
      throw new AuthenticationError('Email or password is incorrect.');
    return transaction(async (client) => {
      await client.query('SELECT id FROM workspaces WHERE id=$1 FOR UPDATE', [
        rows[0].workspace_id,
      ]);
      return session(client, rows[0].workspace_id, email, false);
    });
  },
  authenticate: async (token: string) => {
    const { rows } = await pool.query<{
      workspaceId: string;
      email: string | null;
      demo: boolean;
    }>(
      'SELECT s.workspace_id AS "workspaceId",a.email,w.demo FROM sessions s JOIN workspaces w ON w.id=s.workspace_id LEFT JOIN accounts a ON a.workspace_id=w.id WHERE s.token_hash=$1 AND s.expires_at>now()',
      [hash(token)],
    );
    return rows[0] ?? null;
  },
  logout: async (token: string) => {
    await pool.query('DELETE FROM sessions WHERE token_hash=$1', [hash(token)]);
  },
});
