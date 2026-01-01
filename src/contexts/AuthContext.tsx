'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { logout as logoutApi, getMe } from '@/lib/api-client';
import type { MeResponse } from '@/lib/api-client';

/**
 * Auth Context for Google OAuth Authentication
 *
 * Manages user authentication state, Bearer token, and provides auth methods.
 *
 * Features:
 * - Token stored in localStorage (persisted across sessions)
 * - User profile cached in memory
 * - Automatic token injection into API client
 * - Login/logout methods using generated SDK
 * - Auth state checks
 *
 * Usage:
 * ```tsx
 * const { user, token, login, logout, isAuthenticated } = useAuth();
 * ```
 */

// User type (matches backend MeResponse schema from generated API client)
export type User = MeResponse;

// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'beachrex_auth_token';
const USER_STORAGE_KEY = 'beachrex_auth_user';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('[AuthContext] Failed to parse stored user:', error);
        // Clear invalid data
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    setIsLoading(false);
  }, []);

  // Login: Store token and user
  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  }, []);

  // Logout: Clear token and user using generated SDK
  const logout = useCallback(async () => {
    // Call backend logout endpoint if token exists
    if (token) {
      try {
        await logoutApi();
      } catch (error) {
        console.error('[AuthContext] Logout API call failed:', error);
        // Continue with local logout even if API call fails
      }
    }

    // Clear local state
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, [token]);

  // Refresh user profile from backend using generated SDK
  const refreshUser = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const response = await getMe();
      const data = response.data!;

      setUser(data);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
      // Token is invalid, logout
      await logout();
    }
  }, [token, logout]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 *
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
