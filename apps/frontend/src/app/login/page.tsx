'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/config/environment';
import { FtohInput } from '@/components/FtohInput';
import { FtohButton } from '@/components/FtohButton';
import { FtohCard } from '@/components/FtohCard';

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

interface SnackbarProps {
  message: string;
  type: 'success' | 'error';
  isOpen: boolean;
  onClose: () => void;
}

function Snackbar({ message, type, isOpen, onClose }: SnackbarProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-600 text-white' 
        : 'bg-red-600 text-white'
    }`}>
    <div className="flex items-center">
      <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
        type === 'success' ? 'bg-green-700' : 'bg-red-700'
      }`}>
        {type === 'success' ? (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        )}
      </div>
      <span className="font-medium">{message}</span>
    </div>
  </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error';
    isOpen: boolean;
  }>({
    message: '',
    type: 'success',
    isOpen: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-language': 'en',
        },
        body: JSON.stringify(formData),
      });
      
      const data: LoginResponse = await response.json();

      if (data.success && data.token) {
        // Save token to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_info', JSON.stringify(data.user));
        
        // Show success snackbar
        setSnackbar({
          message: 'Login successful! Redirecting...',
          type: 'success',
          isOpen: true
        });
        
        // Force redirect after a short delay to show snackbar
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        // Show error snackbar
        setSnackbar({
          message: data.message || 'Login failed',
          type: 'error',
          isOpen: true
        });
        
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      // Show error snackbar
      setSnackbar({
        message: 'Connection error. Please try again.',
        type: 'error',
        isOpen: true
      });
      
      setError('Connection error. Please try again.');
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

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
      
      {/* Snackbar */}
      <Snackbar
        message={snackbar.message}
        type={snackbar.type}
        isOpen={snackbar.isOpen}
        onClose={closeSnackbar}
      />
    </main>
  );
}

