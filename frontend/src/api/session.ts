import { sessionSchema, type Session } from '@support-desk/contracts';

const storageKey = 'support-desk-session-v2';

export const readSession = (): Session | null => {
  try {
    return sessionSchema.parse(
      JSON.parse(sessionStorage.getItem(storageKey) ?? 'null'),
    );
  } catch {
    return null;
  }
};

export const saveSession = (session: Session | null) => {
  if (session) sessionStorage.setItem(storageKey, JSON.stringify(session));
  else sessionStorage.removeItem(storageKey);
};
