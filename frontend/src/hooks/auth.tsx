import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Session } from '@support-desk/contracts';
import { client, readSession, saveSession } from '@/api';

type AuthState = {
  session: Session | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
  signIn: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(readSession);
  const queryClient = useQueryClient();
  const identity = useQuery({
    queryKey: ['identity', session?.workspaceId],
    queryFn: client.me,
    enabled: !!session,
    retry: false,
  });

  const replaceSession = async (next: Session | null) => {
    saveSession(next);
    await queryClient.cancelQueries();
    queryClient.clear();
    setSession(next);
  };

  useEffect(() => {
    const expire = () => {
      saveSession(null);
      setSession(null);
      void queryClient.cancelQueries();
      queryClient.clear();
    };
    window.addEventListener('support-session-expired', expire);
    return () => window.removeEventListener('support-session-expired', expire);
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        session,
        loading: !!session && identity.isPending,
        error: identity.error,
        retry: () => {
          void identity.refetch();
        },
        signIn: replaceSession,
        signOut: async () => {
          if (await client.logout()) await replaceSession(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is required.');
  return value;
};
