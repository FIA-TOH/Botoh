'use client';

import { useState } from 'react';
import { AppSnackbar, useAppSnackbar } from '@/components/AppSnackbar';
import { FtohInput } from '@/components/FtohInput';
import { FtohButton } from '@/components/FtohButton';
import { FtohCard } from '@/components/FtohCard';
import { useTranslations } from '@/i18n';

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
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
    teamColor?: string | null;
  };
  message?: string;
}

export default function LoginPage() {
  const { language, t } = useTranslations();
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-language': language,
        },
        body: JSON.stringify(formData),
      });
      
      const data: LoginResponse = await response.json();

      if (data.success && data.token) {
        // Save token to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        
        showSnackbar(t.auth.loginSuccess, 'success');
        
        // Force redirect after a short delay to show snackbar
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        showSnackbar(data.message || t.auth.loginFailed, 'error');
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

