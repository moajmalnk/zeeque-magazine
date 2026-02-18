import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const AUTH_KEY = 'zeeque_auth_tokens';

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, is_onboarded, role } = useAuth();
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

  // Mandatory Onboarding Check
  // Check against both hook state and fallback to localStorage if hook might be lagging
  // Parse user data from local storage for immediate check
  const userData = localStorage.getItem('zeeque_user_data');
  const user = userData ? JSON.parse(userData) : null;
  const isOnboarded = is_onboarded || user?.is_onboarded;
  const userRole = role || user?.role;

  if (isAuth && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Role-based Access Control
  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    // Redirect unauthorized users to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
