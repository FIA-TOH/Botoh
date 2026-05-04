'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import config from '@/config/environment';

interface ChatMessage {
  player: string;
  message: string;
  timestamp: number;
}

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

function ProtectedHome() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user, logout } = useAuth();
  
  // Admin modal states
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
  
  const { socket, isConnected, error, emit, on, off } = useSocket({
    autoConnect: true,
    reconnectAttempts: config.reconnectAttempts,
    reconnectDelay: config.reconnectDelay,
  });

  useEffect(() => {
    if (!socket) return;

    // Listen for chat messages
    const handleChatMessage = (data: { type: string; data: ChatMessage }) => {
      if (data.type === 'chat:message') {
        setMessages(prev => {
          const newMessages = [...prev, data.data];
          // Keep only last N messages
          return newMessages.slice(-config.maxMessages);
        });
      } else {
        console.log('❓ Unknown message type:', data.type);
      }
    };

    on('chat:message', handleChatMessage);

    return () => {
      off('chat:message', handleChatMessage);
    };
  }, [socket, on, off]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 Sending message:', { message: message.trim(), socket: !!socket, isConnected });
    
    if (message.trim() && socket && isConnected) {
      console.log('✅ Emitting chat:send event');
      emit('chat:send', message);
      setMessage('');
      console.log('🔄 Message sent, cleared input');
    } else {
      console.log('❌ Cannot send message:', { 
        hasMessage: !!message.trim(), 
        hasSocket: !!socket, 
        isConnected 
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    console.log('⌨️ Key pressed:', { key: e.key, shiftKey: e.shiftKey });
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log('📤 Sending message via Enter key:', { message: message.trim(), socket: !!socket, isConnected });
      
      if (message.trim() && socket && isConnected) {
        console.log('✅ Emitting chat:send event via Enter');
        emit('chat:send', message);
        setMessage('');
        console.log('🔄 Message sent via Enter, cleared input');
      } else {
        console.log('❌ Cannot send message via Enter:', { 
          hasMessage: !!message.trim(), 
          hasSocket: !!socket, 
          isConnected 
        });
      }
    }
  };

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

  return React.createElement('main', { className: "min-h-screen bg-gray-900 text-white p-8" },
  React.createElement('div', { className: "max-w-4xl mx-auto" },
    // Header with user info and logout
    React.createElement('div', { className: "flex justify-between items-center mb-8" },
      React.createElement('div', null,
        React.createElement('h1', { className: "text-4xl font-bold" }, 'FTOH Haxball Bot'),
        React.createElement('p', { className: "text-gray-300" }, 'Formula ToH Racing System')
      ),
      React.createElement('div', { className: "flex items-center gap-4" },
        // Admin button - only show for admin user
        user?.username === 'admin' && React.createElement('button', {
          onClick: () => setIsModalOpen(true),
          className: "px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
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
          'Create User'
        ),
        React.createElement('div', { className: "text-right" },
          React.createElement('p', { className: "text-sm text-gray-400" }, 'Logged in as'),
          React.createElement('p', { className: "font-semibold" }, user?.username)
        ),
        React.createElement('button', {
          onClick: logout,
          className: "px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        }, 'Logout')
      )
    ),
        
    React.createElement('div', { className: "bg-gray-800 rounded-lg p-6 mb-8" },
      React.createElement('h2', { className: "text-2xl font-semibold mb-4" }, 'Connection Status'),
      React.createElement('div', { className: "flex items-center space-x-2" },
        React.createElement('div', { 
          className: `w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}` 
        }),
        React.createElement('span', null, isConnected ? 'Connected' : 'Disconnected')
      )
    ),

    React.createElement('div', { className: "bg-gray-800 rounded-lg p-6 mb-8" },
      React.createElement('h2', { className: "text-2xl font-semibold mb-4" }, 'Chat'),
      React.createElement('div', { className: "bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto mb-4" },
        messages.length === 0 ? (
          React.createElement('p', { className: "text-gray-400 text-center" }, 'No messages yet...')
        ) : (
          messages.map((msg, index) => (
            React.createElement('div', { key: index, className: "mb-2" },
              React.createElement('span', { className: "text-blue-400 font-semibold" }, `${msg.player}:`),
              ` ${msg.message}`
            )
          ))
        )
      ),
      React.createElement('div', { className: "flex gap-2" },
        React.createElement('input', {
          type: "text",
          value: message,
          onChange: (e) => setMessage(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder: "Type your message...",
          className: "flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled: !isConnected
        }),
        React.createElement('button', {
          onClick: handleSendMessage,
          disabled: !isConnected || !message.trim(),
          className: "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
        }, 'Send')
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

export default function Home() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <ProtectedHome />;
}
