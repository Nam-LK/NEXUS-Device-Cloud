import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useAuth } from './AuthContext';

/** Route guard: chỉ để điều hướng thuận tiện. Quyền truy cập dữ liệu do backend quyết định. */
export function RequireAuth() {
  const { status, error, retry } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Checking your session…" />;
  if (status === 'error' && error) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <ErrorState error={error} title="Cannot reach the NEXUS backend" onRetry={retry} />
      </div>
    );
  }
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
