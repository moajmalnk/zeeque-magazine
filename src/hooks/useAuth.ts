import { useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'zeeque_editorial_auth';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
}

const CREDENTIALS = {
  email: 'zeeque@gmail.com',
  password: '1',
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
  });

  // Check authentication on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.isAuthenticated && parsed.email === CREDENTIALS.email) {
          setAuthState({
            isAuthenticated: true,
            email: parsed.email,
          });
        } else {
          localStorage.removeItem(AUTH_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
      const authData = {
        isAuthenticated: true,
        email: email,
        timestamp: Date.now(),
      };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setAuthState({
        isAuthenticated: true,
        email: email,
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setAuthState({
      isAuthenticated: false,
      email: null,
    });
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    email: authState.email,
    login,
    logout,
  };
}
