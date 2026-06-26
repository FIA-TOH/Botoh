'use client';

import { ReactNode, useLayoutEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  children: ReactNode;
}

export function AuthGate({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const isLoginPage = pathname === '/login';
  const isPublicWidget = pathname.startsWith('/widgets');

  useLayoutEffect(() => {
    if (isPublicWidget) return;
    if (isLoading) return;

    if (!isAuthenticated && !isLoginPage) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isLoginPage) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, isLoginPage, isPublicWidget, router]);

  if (isPublicWidget) {
    return children;
  }

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated && !isLoginPage) {
    return null;
  }

  if (isAuthenticated && isLoginPage) {
    return null;
  }

  return children;
}
