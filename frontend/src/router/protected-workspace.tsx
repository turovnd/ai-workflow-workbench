import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { PageLoading, RequestError } from '@/components/layout';
import { Path } from './paths';

export const ProtectedWorkspace = () => {
  const auth = useAuth();
  const location = useLocation();
  if (!auth.session)
    return (
      <Navigate
        to={Path.Login}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  if (auth.loading) return <PageLoading label="Opening your workspace" />;
  if (auth.error)
    return (
      <RequestError
        title="Couldn’t open your workspace"
        error={auth.error}
        retry={auth.retry}
      />
    );
  return <Outlet key={auth.session.workspaceId} />;
};
