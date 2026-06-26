'use client';

import { ReactNode, useEffect } from 'react';

interface Props {
  children: ReactNode;
}

export function WidgetShell({ children }: Props) {
  useEffect(() => {
    const previousBodyBackground = document.body.style.background;
    const previousHtmlBackground = document.documentElement.style.background;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.background = previousBodyBackground;
      document.documentElement.style.background = previousHtmlBackground;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent text-white">
      {children}
    </div>
  );
}
