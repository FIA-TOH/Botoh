'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { usePlayerList, PlayerData } from '@/hooks/usePlayerList';
import config from '@/config/environment';

interface ChatMessage {
  player: string;
  message: string;
  timestamp: number;
}

function ProtectedRaceControl() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { user, logout } = useAuth();
  const router = useRouter();
  const { playerList } = usePlayerList();
  
  const { socket, isConnected, emit, on, off } = useSocket({
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

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleLogout = () => {
    logout();
  };

  return React.createElement('main', { className: "min-h-screen bg-gray-900 text-white p-8" },
    React.createElement('div', { className: "max-w-6xl mx-auto" },
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
      
      // Top section: Chat and Player List side by side
      React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8" },
        // Chat section (takes 2 columns on large screens)
        React.createElement('div', { className: "lg:col-span-2" },
          React.createElement('div', { className: "bg-gray-800 rounded-lg p-6 h-full" },
            React.createElement('h2', { className: "text-2xl font-semibold mb-4" }, 'Chat'),
            React.createElement('div', { className: "space-y-4" },
              // Messages area
              React.createElement('div', { 
                className: "bg-gray-700 rounded-lg p-4 h-96 overflow-y-auto mb-4" 
              },
                messages.length === 0 ? (
                  React.createElement('p', { className: "text-gray-400 text-center" }, 'No messages yet...')
                ) : (
                  messages.map((msg, index) => (
                    React.createElement('div', { 
                      key: index,
                      className: "mb-2 p-2 bg-gray-600 rounded"
                    },
                      React.createElement('div', { className: "font-semibold text-blue-400" }, msg.player),
                      React.createElement('div', { className: "text-gray-200" }, msg.message)
                    )
                  ))
                )
              ),
              
              // Message input
              React.createElement('form', { 
                onSubmit: handleSendMessage,
                className: "flex gap-2"
              },
                React.createElement('input', {
                  type: "text",
                  value: message,
                  onChange: (e) => setMessage(e.target.value),
                  placeholder: "Digite sua mensagem...",
                  className: "flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                }),
                React.createElement('button', {
                  type: "submit",
                  disabled: !isConnected || !message.trim(),
                  className: "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                }, 'Enviar')
              )
            )
          )
        ),
        
        // Live Player List section (takes 1 column on large screens)
        React.createElement('div', { className: "lg:col-span-1" },
          React.createElement('div', { className: "bg-gray-800 rounded-lg p-6 h-full" },
            React.createElement('h2', { className: "text-2xl font-semibold mb-4" }, 'Jogadores Ao Vivo'),
            React.createElement('div', { className: "space-y-2 max-h-96 overflow-y-auto" },
              playerList ? (
                React.createElement(React.Fragment, null,
                  React.createElement('div', { className: "text-sm text-gray-400 mb-2" },
                    `Última atualização: ${new Date(playerList.timestamp).toLocaleTimeString()}`
                  ),
                  React.createElement('div', { className: "text-lg font-semibold mb-2" },
                    `${playerList.playerCount} jogadores na sala`
                  ),
                  playerList.players.map((player: PlayerData) => (
                    React.createElement('div', { 
                      key: player.id,
                      className: `bg-gray-700 rounded-lg p-3 border-l-4 ${
                        player.team === 0 ? 'border-gray-500' : 
                        player.team === 1 ? 'border-blue-500' : 'border-red-500'
                      }`
                    },
                      React.createElement('div', { className: "flex items-center justify-between" },
                        React.createElement('div', { className: "flex items-center gap-2" },
                          React.createElement('div', { 
                            className: `w-8 h-8 rounded-full ${
                              player.admin ? 'bg-purple-600' : 'bg-gray-600'
                            }` 
                          }),
                          React.createElement('div', null,
                            React.createElement('div', { className: "font-semibold" }, player.name),
                            player.admin && React.createElement('span', { 
                              className: "ml-2 text-xs bg-purple-600 px-2 py-1 rounded" 
                            }, 'ADMIN')
                          )
                        ),
                        React.createElement('div', { className: "text-sm text-gray-400" },
                          `Time ${player.team === 0 ? '🔴' : player.team === 1 ? '🔵' : '🔴'}`
                        )
                      ),
                      React.createElement('div', { className: "text-xs text-gray-400 mt-2" },
                        `Pos: (${Math.round(player.position.x)}, ${Math.round(player.position.y)})`
                      )
                    )
                  ))
                )
              ) : (
                React.createElement('p', { className: "text-gray-400 text-center" }, 'Aguardando dados dos jogadores...')
              )
            )
          )
        )
      ),
      
      // Bottom section: Live Map
      React.createElement('div', { className: "bg-gray-800 rounded-lg p-6" },
        React.createElement('h2', { className: "text-2xl font-semibold mb-4" }, 'Mapa Ao Vivo'),
        React.createElement('div', { 
          className: "relative bg-gray-700 rounded-lg mx-auto",
          style: { 
            width: '100%', 
            maxWidth: '800px', 
            height: '600px',
            position: 'relative'
          }
        },
          // Map grid lines
          React.createElement('div', { 
            className: "absolute inset-0 pointer-events-none",
            style: {
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }
          }),
          // Center lines (X=0, Y=0)
          React.createElement('div', {
            className: "absolute bg-red-500 opacity-50 pointer-events-none",
            style: {
              left: '50%',
              top: '0',
              width: '1px',
              height: '100%'
            }
          }),
          React.createElement('div', {
            className: "absolute bg-red-500 opacity-50 pointer-events-none",
            style: {
              left: '0',
              top: '50%',
              width: '100%',
              height: '1px'
            }
          }),
          // Player dots
          playerList && playerList.players.map((player: PlayerData) => {
            // Convert Haxball coordinates to map coordinates
            // Map center is at (0,0), map size is 10000x10000
            // Display area is 800x600, so scale factor is 800/10000 = 0.08
            const mapX = 400 + (player.position.x * 0.08); // 400 is center of 800px width
            const mapY = 300 + (player.position.y * 0.08); // 300 is center of 600px height, Y positive goes up
            
            return React.createElement('div', {
              key: player.id,
              className: `absolute w-3 h-3 rounded-full ${
                player.team === 0 ? 'bg-red-500' : 
                player.team === 1 ? 'bg-blue-500' : 'bg-gray-500'
              }`,
              style: {
                left: `${mapX}px`,
                top: `${mapY}px`,
                transform: 'translate(-50%, -50%)', // Center the dot on the position
                boxShadow: player.admin ? '0 0 10px rgba(147, 51, 234, 0.8)' : 'none'
              },
              title: `${player.name} (${Math.round(player.position.x)}, ${Math.round(player.position.y)})`
            });
          }),
          // Coordinate labels
          React.createElement('div', {
            className: "absolute text-xs text-gray-400 pointer-events-none",
            style: { left: '10px', top: '10px' }
          }, '(0, 5000)'),
          React.createElement('div', {
            className: "absolute text-xs text-gray-400 pointer-events-none",
            style: { right: '10px', top: '10px' }
          }, '(10000, 5000)'),
          React.createElement('div', {
            className: "absolute text-xs text-gray-400 pointer-events-none",
            style: { left: '10px', bottom: '10px' }
          }, '(0, -5000)'),
          React.createElement('div', {
            className: "absolute text-xs text-gray-400 pointer-events-none",
            style: { right: '10px', bottom: '10px' }
          }, '(10000, -5000)')
        )
      )
    )
  );
}

export default function RaceControlPage() {
  const { isLoading, isAuthenticated } = useAuth();

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

  return React.createElement(ProtectedRaceControl);
}
