'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type AppSnackbarType = 'success' | 'error';

interface AppSnackbarState {
  message: string;
  type: AppSnackbarType;
  isOpen: boolean;
}

interface AppSnackbarProps extends AppSnackbarState {
  onClose: () => void;
  durationMs?: number;
}

const INITIAL_SNACKBAR: AppSnackbarState = {
  message: '',
  type: 'success',
  isOpen: false,
};

export function useAppSnackbar() {
  const [snackbar, setSnackbar] = useState<AppSnackbarState>(INITIAL_SNACKBAR);

  const showSnackbar = useCallback((message: string, type: AppSnackbarType) => {
    setSnackbar({ message, type, isOpen: true });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((current) => ({ ...current, isOpen: false }));
  }, []);

  return { snackbar, showSnackbar, closeSnackbar };
}

export function AppSnackbar({
  message,
  type,
  isOpen,
  onClose,
  durationMs = 3000,
}: AppSnackbarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 top-4 z-[9999] max-w-[calc(100vw-2rem)] rounded-lg px-5 py-3 text-white shadow-2xl transition-all duration-300 sm:max-w-md ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            type === 'success' ? 'bg-green-700' : 'bg-red-700'
          }`}
        >
          {type === 'success' ? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <span className="break-words font-medium">{message}</span>
      </div>
    </div>,
    document.body,
  );
}
