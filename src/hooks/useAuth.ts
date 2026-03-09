import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { UserRole } from '@/types/user';

const AUTH_KEY = 'zeeque_auth_tokens';
const USER_KEY = 'zeeque_user_data';

interface AuthState {
  isAuthenticated: boolean;
  id: string | null;
  email: string | null;
  role: UserRole | null;
  username: string | null;
  school_name: string | null;
  teacher_name: string | null;
  phone_number: string | null;
  profile_image: string | null;
  is_onboarded: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    id: null,
    email: null,
    role: null,
    username: null,
    school_name: null,
    teacher_name: null,
    phone_number: null,
    profile_image: null,
    is_onboarded: false,
    isLoading: true,
  });

  // Sync auth state across different useAuth instances on the same page
  const loadAuth = useCallback(() => {
    const tokens = localStorage.getItem(AUTH_KEY);
    const userData = localStorage.getItem(USER_KEY);

    if (tokens && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setAuthState({
          isAuthenticated: true,
          id: parsedUser.id || null,
          email: parsedUser.email,
          role: parsedUser.role || null,
          username: parsedUser.username || null,
          school_name: parsedUser.school_name || null,
          teacher_name: parsedUser.teacher_name || null,
          phone_number: parsedUser.phone_number || null,
          profile_image: parsedUser.profile_image || null,
          is_onboarded: parsedUser.is_onboarded || false,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        id: null,
        email: null,
        role: null,
        username: null,
        school_name: null,
        teacher_name: null,
        phone_number: null,
        profile_image: null,
        is_onboarded: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    loadAuth();

    // Listen for custom event to sync state across hooks
    const handleAuthChange = () => loadAuth();
    window.addEventListener('zeeque_auth_changed', handleAuthChange);
    // Also listen to cross-tab storage changes
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('zeeque_auth_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [loadAuth]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/token/', {
        email,
        password
      });

      const { access, refresh, role, username, school_name, teacher_name, phone_number, is_onboarded, id, profile_image } = response.data;

      localStorage.setItem(AUTH_KEY, JSON.stringify({ access, refresh }));
      localStorage.setItem(USER_KEY, JSON.stringify({ email, role, username, school_name, teacher_name, phone_number, is_onboarded, id, profile_image }));

      setAuthState({
        isAuthenticated: true,
        id: id,
        email: email,
        role: role,
        username: username,
        school_name: school_name,
        teacher_name: teacher_name,
        phone_number: phone_number,
        profile_image: profile_image,
        is_onboarded: is_onboarded,
        isLoading: false,
      });

      window.dispatchEvent(new Event('zeeque_auth_changed'));

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    const tokenString = localStorage.getItem(AUTH_KEY);

    // 1. Clear state and localStorage IMMEDIATELY synchronously
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];

    setAuthState({
      isAuthenticated: false,
      id: null,
      email: null,
      role: null,
      username: null,
      school_name: null,
      teacher_name: null,
      phone_number: null,
      profile_image: null,
      is_onboarded: false,
      isLoading: false,
    });

    window.dispatchEvent(new Event('zeeque_auth_changed'));

    // 2. Blacklist token in the background asynchronously
    try {
      if (tokenString) {
        const { refresh } = JSON.parse(tokenString);
        if (refresh) {
          await api.post('/token/blacklist/', { refresh });
        }
      }
    } catch {
      // Silently ignore
    }
  }, []);

  const user = authState.isAuthenticated ? {
    id: authState.id,
    email: authState.email,
    username: authState.username,
    role: authState.role,
    school_name: authState.school_name,
    teacher_name: authState.teacher_name,
    phone_number: authState.phone_number,
    profile_image: authState.profile_image,
    is_onboarded: authState.is_onboarded
  } : null;

  const syncUser = useCallback((updatedUser: Partial<AuthState>) => {
    const userData = localStorage.getItem(USER_KEY);
    if (userData) {
      const currentData = JSON.parse(userData);
      const newData = { ...currentData, ...updatedUser };
      localStorage.setItem(USER_KEY, JSON.stringify(newData));

      setAuthState(prev => ({
        ...prev,
        ...updatedUser
      }));
    }
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    user,
    id: authState.id,
    email: authState.email,
    role: authState.role,
    username: authState.username,
    school_name: authState.school_name,
    teacher_name: authState.teacher_name,
    phone_number: authState.phone_number,
    profile_image: authState.profile_image,
    is_onboarded: authState.is_onboarded,
    isLoading: authState.isLoading,
    login,
    logout,
    syncUser,
  };
}
