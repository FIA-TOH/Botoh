'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import config from '@/config/environment';

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
    level: number;
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
      const response = await fetch(`${config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">FTOH</h1>
          <p className="text-gray-300">Formula ToH Racing System</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 p-8">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            Sign In
          </h2>

          {/* Default Credentials Info */}
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-6">
            <p className="text-blue-300 text-sm text-center">
              Default credentials: <span className="font-mono">admin / admin123</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 mb-6">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Protected authentication system
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
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
