'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import config from '@/config/environment';

interface CreateUserFormData {
  username: string;
  password: string;
}

interface SnackbarProps {
  message: string;
  type: 'success' | 'error';
  isOpen: boolean;
  onClose: () => void;
}

function Snackbar({ message, type, isOpen, onClose }: SnackbarProps) {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return React.createElement('div', { 
    className: `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
      type === 'success' 
        ? 'bg-green-600 text-white' 
        : 'bg-red-600 text-white'
    }` 
  },
    React.createElement('div', { className: "flex items-center" },
      React.createElement('div', { 
        className: `w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
          type === 'success' ? 'bg-green-700' : 'bg-red-700'
        }` 
      },
        type === 'success' ? (
          React.createElement('svg', {
            className: "w-4 h-4 text-white",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          },
            React.createElement('path', {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              d: "M5 13l4 4L19 7"
            })
          )
        ) : (
          React.createElement('svg', {
            className: "w-4 h-4 text-white",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24"
          },
            React.createElement('path', {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: "2",
              d: "M6 18L18 6M6 6l12 12"
            })
          )
        )
      ),
      React.createElement('span', { className: "font-medium" }, message)
    )
  );
}

function ProtectedAdmin() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState<CreateUserFormData>({
    username: '',
    password: ''
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error';
    isOpen: boolean;
  }>({
    message: '',
    type: 'success',
    isOpen: false
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${config.apiUrl}/auth/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(createUserForm),
      });

      const data = await response.json();

      if (data.success) {
        setSnackbar({
          message: `User "${createUserForm.username}" created successfully!`,
          type: 'success',
          isOpen: true
        });
        
        // Reset form and close modal
        setCreateUserForm({ username: '', password: '' });
        setIsModalOpen(false);
      } else {
        setSnackbar({
          message: data.message || 'Failed to create user',
          type: 'error',
          isOpen: true
        });
      }
    } catch (error) {
      console.error('Create user error:', error);
      setSnackbar({
        message: 'Connection error. Please try again.',
        type: 'error',
        isOpen: true
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar((prev: any) => ({ ...prev, isOpen: false }));
  };

  const handleCreateUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateUserForm((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleLogout = () => {
    logout();
  };

  return React.createElement('main', { className: "min-h-screen bg-gray-900 text-white p-8" },
    React.createElement('div', { className: "max-w-4xl mx-auto" },
      // Header with navigation
      React.createElement('div', { className: "flex justify-between items-center mb-8" },
        React.createElement('div', { className: "flex items-center gap-4" },
          React.createElement('button', {
            onClick: handleBackToHome,
            className: "px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
          },
            React.createElement('svg', {
              className: "w-5 h-5",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24"
            },
              React.createElement('path', {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M10 19l-7-7m0 0l7-7m-7 7h18"
              })
            ),
            'Voltar'
          ),
          React.createElement('div', null,
            React.createElement('h1', { className: "text-3xl font-bold" }, 'Administração'),
            React.createElement('p', { className: "text-gray-300" }, 'Painel Administrativo')
          )
        ),
        React.createElement('div', { className: "flex items-center gap-4" },
          React.createElement('div', { className: "text-right" },
            React.createElement('p', { className: "text-sm text-gray-400" }, 'Logged in as'),
            React.createElement('p', { className: "font-semibold" }, user?.username)
          ),
          React.createElement('button', {
            onClick: handleLogout,
            className: "px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          }, 'Logout')
        )
      ),
      
      // Admin content
      React.createElement('div', { className: "bg-gray-800 rounded-lg p-8" },
        React.createElement('h2', { className: "text-2xl font-semibold mb-6" }, 'Gerenciamento de Usuários'),
        
        React.createElement('div', { className: "space-y-4" },
          React.createElement('p', { className: "text-gray-300" }, 'Aqui você pode gerenciar os usuários do sistema.'),
          
          React.createElement('button', {
            onClick: () => setIsModalOpen(true),
            className: "px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
          },
            React.createElement('svg', {
              className: "w-5 h-5",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24"
            },
              React.createElement('path', {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              })
            ),
            'Criar Novo Usuário'
          )
        )
      ),

      // Create User Modal
      isModalOpen && React.createElement('div', { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" },
        React.createElement('div', { className: "bg-gray-800 rounded-lg p-6 w-full max-w-md" },
          React.createElement('h2', { className: "text-2xl font-bold mb-4" }, 'Create New User'),
          
          React.createElement('form', { onSubmit: handleCreateUser },
            React.createElement('div', { className: "mb-4" },
              React.createElement('label', { className: "block text-sm font-medium mb-2" }, 'Username'),
              React.createElement('input', {
                type: "text",
                name: "username",
                value: createUserForm.username,
                onChange: handleCreateUserFormChange,
                required: true,
                minLength: 3,
                maxLength: 50,
                pattern: "[a-zA-Z0-9_]+",
                className: "w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                placeholder: "Enter username (3-50 chars)",
                disabled: isCreatingUser
              })
            ),

            React.createElement('div', { className: "mb-6" },
              React.createElement('label', { className: "block text-sm font-medium mb-2" }, 'Password'),
              React.createElement('input', {
                type: "password",
                name: "password",
                value: createUserForm.password,
                onChange: handleCreateUserFormChange,
                required: true,
                minLength: 6,
                className: "w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500",
                placeholder: "Enter password (min 6 chars)",
                disabled: isCreatingUser
              })
            ),

            React.createElement('div', { className: "flex gap-3" },
              React.createElement('button', {
                type: "submit",
                disabled: isCreatingUser,
                className: "flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-500 text-white py-2 rounded-lg transition-colors flex items-center justify-center"
              },
                isCreatingUser ? [
                  React.createElement('div', { 
                    key: 'spinner',
                    className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" 
                  }),
                  'Creating...'
                ] : 'Create User'
              ),
              
              React.createElement('button', {
                type: "button",
                onClick: () => setIsModalOpen(false),
                disabled: isCreatingUser,
                className: "flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white py-2 rounded-lg transition-colors"
              }, 'Cancel')
            )
          )
        )
      ),

      // Snackbar
      React.createElement(Snackbar, {
        message: snackbar.message,
        type: snackbar.type,
        isOpen: snackbar.isOpen,
        onClose: closeSnackbar
      })
    )
  );
}

export default function AdminPage() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return React.createElement('div', { 
      className: "min-h-screen bg-gray-900 flex items-center justify-center" 
    }, 
      React.createElement('div', { className: "text-center" }, [
        React.createElement('div', { 
          key: 'spinner',
          className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" 
        }),
        React.createElement('p', { 
          key: 'text',
          className: "text-gray-300" 
        }, 'Loading...')
      ])
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user is admin
  if (user?.role !== 'admin') {
    return React.createElement('div', { 
      className: "min-h-screen bg-gray-900 flex items-center justify-center" 
    }, 
      React.createElement('div', { className: "text-center text-white" },
        React.createElement('h1', { className: "text-2xl font-bold mb-4" }, 'Acesso Negado'),
        React.createElement('p', { className: "text-gray-300 mb-6" }, 'Você não tem permissão para acessar esta página.'),
        React.createElement('button', {
          onClick: () => window.location.href = '/',
          className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        }, 'Voltar para Home')
      )
    );
  }

  return React.createElement(ProtectedAdmin);
}
