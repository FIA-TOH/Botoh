'use client';

import { useTranslations } from '@/i18n';

export function LoadingScreen() {
  const { t } = useTranslations();
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />

        <p className="text-gray-300">
          {t.common.loading}
        </p>
      </div>
    </div>
  );
}