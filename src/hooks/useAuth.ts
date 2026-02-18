import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { UserRole } from '@/types/user';

const AUTH_KEY = 'zeeque_auth_tokens';
const USER_KEY = 'zeeque_user_data';

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
  role: UserRole | null;
  username: string | null;
  school_name: string | null;
  is_onboarded: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    email: null,
    role: null,
    username: null,
    school_name: null,
    is_onboarded: false,
    isLoading: true,
  });

  // Check for existing tokens on mount
  useEffect(() => {
    const tokens = localStorage.getItem(AUTH_KEY);
    const userData = localStorage.getItem(USER_KEY);

    if (tokens && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          email: parsedUser.email,
          role: parsedUser.role || null,
          username: parsedUser.username || null,
          school_name: parsedUser.school_name || null,
          is_onboarded: parsedUser.is_onboarded || false,
          isLoading: false,
        });

        // Ensure tokens are attached to API
        const { access } = JSON.parse(tokens);
        // api.defaults.headers.common['Authorization'] = `Bearer ${access}`; // Removed: Interceptor handles this.
      } catch {
        // Corrupt data
        logout();
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // 1. Get Tokens
      const response = await api.post('/token/', {
        email,
        password
      });

      const { access, refresh, role, username, school_name, is_onboarded } = response.data;

      // 2. Store Tokens & User Data
      localStorage.setItem(AUTH_KEY, JSON.stringify({ access, refresh }));
      localStorage.setItem(USER_KEY, JSON.stringify({ email, role, username, school_name, is_onboarded }));

      // 3. Update API defaults
      // 3. Update API defaults (Handled by interceptor now)
      // api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      // 4. Update State
      setAuthState({
        isAuthenticated: true,
        email: email,
        role: role,
        username: username,
        school_name: school_name,
        is_onboarded: is_onboarded,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];

    setAuthState({
      isAuthenticated: false,
      email: null,
      role: null,
      username: null,
      school_name: null,
      is_onboarded: false,
      isLoading: false,
    });
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    email: authState.email,
    role: authState.role,
    username: authState.username,
    school_name: authState.school_name,
    is_onboarded: authState.is_onboarded,
    isLoading: authState.isLoading,
    login,
    logout,
  };
}
