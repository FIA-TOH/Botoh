'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/config/environment';

interface User {
  id: string;
  username: string;
  role: string;
  money: number;
  level: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user_info');

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
            const response = await fetch(`${config.apiUrl}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
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
            // Keep localStorage auth even if backend fails
          }
        }
      } catch (error) {
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    setUser(null);
    setToken(null);
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.token && data.user) {
        // Save to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        
        // Update state
        setUser(data.user);
        setToken(data.token);

        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Connection error' };
    }
  };

  const logout = () => {
    clearAuthData();
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
    const { isAuthenticated, isLoading } = useAuth();
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
          }, 'Loading...')
        ])
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect
    }

    return React.createElement(Component, props);
  };
}
