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

  useLayoutEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isLoginPage) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && isLoginPage) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

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
