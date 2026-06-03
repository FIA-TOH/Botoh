'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppSnackbar, useAppSnackbar } from '@/components/AppSnackbar';
import { FtohInput } from '@/components/FtohInput';
import { FtohButton } from '@/components/FtohButton';
import { FtohCard } from '@/components/FtohCard';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from '@/i18n';

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { t } = useTranslations();
  const { login } = useAuth();
  const router = useRouter();
  const { snackbar, showSnackbar, closeSnackbar } = useAppSnackbar();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        showSnackbar(t.auth.loginSuccess, 'success');
        
        setTimeout(() => {
          router.replace('/');
        }, 500);
      } else {
        showSnackbar(result.code === 'CONNECTION_ERROR' ? t.auth.connectionError : result.message || t.auth.loginFailed, 'error');
      }
    } catch (error) {
      showSnackbar(t.auth.connectionError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-8 py-8 sm:px-10 lg:justify-end lg:p-0"
      style={{ backgroundImage: 'url(/img/bg/loginbg.png)' }}
    >
      <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: 0.29 }} />

      <div
        className="pointer-events-none absolute right-0 top-0 hidden h-full w-[20%] lg:block"
        style={{ backgroundColor: '#AF0034', opacity: 0.67 }}
      />

      <div className="relative z-10 flex w-full justify-center lg:h-screen lg:w-1/2 lg:items-center lg:px-8">
        <FtohCard title={t.auth.loginTitle} className="max-w-[min(100%,28rem)]">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <FtohInput
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder={t.auth.usernamePlaceholder}
              disabled={isLoading}
            />

            <FtohInput
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder={t.auth.passwordPlaceholder}
              disabled={isLoading}
            />

            <FtohButton
              type="submit"
              loading={isLoading}
              loadingText={t.auth.signingIn}
            >
              {t.auth.signIn}
            </FtohButton>
          </form>
        </FtohCard>
      </div>
      
      <AppSnackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.isOpen}
        onClose={closeSnackbar}
      />
    </main>
  );
}

