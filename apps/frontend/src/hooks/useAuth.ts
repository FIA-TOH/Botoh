'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiUrl } from '@/config/api';
import { clearAuthCookie, setAuthCookie } from '@/config/authCookie';

interface User {
  id: string;
  username: string;
  role: string;
  money: number;
  level?: number;
  shortUsername?: string | null;
  driverNumber?: number | null;
  teamId?: string | null;
  teamName?: string | null;
  teamTag?: string | null;
  teamEmoji?: string | null;
  teamColor?: string | null;
  teamMemberships?: TeamMembership[];
  language?: 'pt' | 'en' | 'es';
}

export interface TeamMembership {
  teamId: string;
  teamName: string;
  teamTag: string;
  teamEmoji?: string | null;
  teamColor: string;
  pitLevel?: number | null;
  weatherLevel?: number | null;
  roles: ('team_principal' | 'team_assistant' | 'driver' | 'engineer')[];
  driverCategory?: 'starter' | 'reserve' | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; code?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredAuthData(): { user: User | null; token: string | null } {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  const storedToken = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('user_info');

  if (!storedToken || !storedUser) {
    return { user: null, token: null };
  }

  try {
    return {
      user: JSON.parse(storedUser),
      token: storedToken,
    };
  } catch (error) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialAuth] = useState(getStoredAuthData);
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [token, setToken] = useState<string | null>(initialAuth.token);
  const [isLoading, setIsLoading] = useState(() => Boolean(initialAuth.token));
  const router = useRouter();

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    clearAuthCookie();
    setUser(null);
    setToken(null);
  }, []);

  const redirectToLogin = useCallback(() => {
    clearAuthData();
    router.replace('/login');
  }, [clearAuthData, router]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user_info');

        if (!storedToken || !storedUser) {
          clearAuthData();
          setIsLoading(false);
          return;
        }

        if (storedToken && storedUser) {
          // Parse stored user data first
          let userData;
          try {
            userData = JSON.parse(storedUser);
          } catch (e) {
            clearAuthData();
            setIsLoading(false);
            return;
          }

          // Set user immediately from localStorage (optimistic)
          setUser(userData);
          setToken(storedToken);

          // Verify token with backend (async)
          try {
            const response = await fetch(apiUrl('/api/auth/me'), {
              cache: 'no-store',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Cache-Control': 'no-cache',
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                setUser(data.user);
              } else {
                clearAuthData();
              }
            } else {
              clearAuthData();
            }
          } catch (verifyError) {
            // Keep localStorage auth on transient connection failures.
          }
        }
      } catch (error) {
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [clearAuthData]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const authApiBaseUrl = apiUrl('/api/auth');
    const protectedApiBaseUrl = apiUrl('/api');

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      const requestUrl = typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

      const isProtectedApiRequest = requestUrl.startsWith(protectedApiBaseUrl);
      const isAuthAction = requestUrl.startsWith(`${authApiBaseUrl}/login`)
        || requestUrl.startsWith(`${authApiBaseUrl}/logout`);

      if (response.status === 401 && isProtectedApiRequest && !isAuthAction) {
        redirectToLogin();
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [redirectToLogin]);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string; code?: string }> => {
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-language': user?.language ?? 'pt',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        // Save to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        setAuthCookie(data.token);
        
        // Update state
        setUser(data.user);
        setToken(data.token);

        return { success: true };
      } else {
        return { success: false, message: data.message, code: data.code };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, code: 'CONNECTION_ERROR' };
    }
  };

  const logout = () => {
    clearAuthData();
    fetch(apiUrl('/api/auth/logout'), {
      method: 'POST',
    }).catch(() => {
      // Local logout already completed; cookie cleanup can fail silently.
    });
    router.push('/login');
  };

  // Simplified token refresh - just check if token exists
  const refreshToken = async (): Promise<boolean> => {
    return !!token;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshToken,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return React.createElement('div', { 
        className: "min-h-screen bg-gray-900 flex items-center justify-center" 
      }, 
        React.createElement('div', { className: "text-center" }, [
          React.createElement('div', { 
            key: 'spinner',
            className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" 
          }),
          React.createElement('p', { 
            key: 'text',
            className: "text-gray-300" 
          }, user?.language === 'en' ? 'Loading...' : user?.language === 'es' ? 'Cargando...' : 'Carregando...')
        ])
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect
    }

    return React.createElement(Component, props);
  };
}
