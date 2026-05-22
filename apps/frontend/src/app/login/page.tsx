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
        showSnackbar(result.message || t.auth.loginFailed, 'error');
      }
    } catch (error) {
      showSnackbar(t.auth.connectionError, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative" style={{ backgroundImage: 'url(/img/bg/loginbg.png)' }}>
      {/* Black overlay with 29% opacity */}
      <div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: 0.29 }}></div>
      
      {/* Red block covering 50% of screen on the right with 67% opacity */}
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none" style={{ backgroundColor: '#AF0034', opacity: 0.67 }}></div>
      
      {/* Login container - no opacity inheritance */}
      <div className="absolute top-0 right-0 w-1/2 h-full flex items-center justify-center pointer-events-none">
        <FtohCard title="LOGIN">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <FtohInput
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Username"
              disabled={isLoading}
            />

            {/* Password Field */}
            <FtohInput
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Password"
              disabled={isLoading}
            />

            {/* Submit Button */}
            <FtohButton
              type="submit"
              loading={isLoading}
              loadingText="Signing in..."
            >
              SIGN IN
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

