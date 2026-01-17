import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const AUTH_KEY = 'zeeque_editorial_auth';

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Check localStorage directly for immediate authentication verification
  // This ensures we check the most up-to-date auth state
  const checkAuth = () => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated && parsed.email === 'zeeque@gmail.com') {
          return true;
        }
      }
    } catch {
      // Invalid auth data
    }
    return false;
  };

  const isAuth = isAuthenticated || checkAuth();

  if (!isAuth) {
    // Redirect to login page, saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
