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

  // Check for existing tokens on mount
  useEffect(() => {
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

        // Ensure tokens are attached to API
        const { access } = JSON.parse(tokens);
      } catch {
        // Corrupt data
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
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

      const { access, refresh, role, username, school_name, teacher_name, phone_number, is_onboarded, id, profile_image } = response.data;

      // 2. Store Tokens & User Data
      localStorage.setItem(AUTH_KEY, JSON.stringify({ access, refresh }));
      localStorage.setItem(USER_KEY, JSON.stringify({ email, role, username, school_name, teacher_name, phone_number, is_onboarded, id, profile_image }));

      // 3. Update State
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

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    // Blacklist the refresh token on the backend so it cannot be reused
    try {
      const tokenString = localStorage.getItem(AUTH_KEY);
      if (tokenString) {
        const { refresh } = JSON.parse(tokenString);
        if (refresh) {
          await api.post('/token/blacklist/', { refresh });
        }
      }
    } catch {
      // Silently ignore — we still clear the local session regardless
    }

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
  };
}
