import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const AUTH_KEY = 'zeeque_auth_tokens';

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  // Check localStorage directly for immediate authentication verification
  const isAuth = isAuthenticated || !!localStorage.getItem(AUTH_KEY);

  if (!isAuth) {
    // Redirect to login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
