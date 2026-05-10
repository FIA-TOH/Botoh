'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { usePlayerList, PlayerData } from '@/hooks/usePlayerList';
import config from '@/config/environment';
import { FtohButton } from '@/components/FtohButton';
import { FtohBack } from '@/components/FtohBack';
import { FtohHeader } from '@/components/FtohHeader';
import { mockRaceData, SessionType } from '@/mocks/raceData';

interface ChatMessage {
  player: string;
  message: string;
  timestamp: number;
}

function ProtectedPitWall() {
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

  return React.createElement('main', { 
    className: "min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-white p-8 relative overflow-hidden", 
    style: { backgroundImage: 'url(/img/bg/pitwallwpp.png)' }
  },
    // Black overlay with 67% opacity
    React.createElement('div', { 
      className: "absolute inset-0 bg-black pointer-events-none", 
      style: { opacity: 0.67 } 
    }),
    React.createElement('div', { className: "max-w-6xl mx-auto relative z-10" },
      // Header with navigation
      React.createElement('div', { className: "mb-8" },
        React.createElement(FtohHeader, {
          onLogout: handleLogout,
          showBackButton: true,
          onBackClick: handleBackToHome
        })
      ),
      
      // Main content grid
      React.createElement('div', { 
        className: "grid mb-8",
        style: {
          display: 'grid',
          gridTemplateColumns: '5fr 11fr 11fr',
          gridTemplateRows: '7fr 5fr',
          gridTemplateAreas: `
            "players chat race-info"
            "players map map"
          `,
          minHeight: '600px',
          gap: '32px'
        }
      },
        // Position section (left, spans both rows)
        React.createElement('div', {
          style: { gridArea: 'players', backgroundColor: '#1E1E1E', outline: '8px solid #FF232B' },
          className: "px-0 py-2 h-fit"
        },
          React.createElement('div', { className: "text-4xl font-bold text-center" }, 
            mockRaceData.sessionType === 'RACE' ? 'RACE' : 
            mockRaceData.sessionType === 'QUALY' ? 'QUALY' : 'TRAINING'
          ),
          React.createElement('div', { 
            className: "text-xl text-center mb-2",
            dangerouslySetInnerHTML: { 
              __html: `LAP <strong>${mockRaceData.currentLap}</strong>/${mockRaceData.totalLaps}` 
            }
          }),
          React.createElement('div', {
            className: "border-b border-white",
            style: { width: '100%', height: '1px' }
          }),
          React.createElement('div', { className: "space-y-2, px-2 overflow-y-auto" },
            mockRaceData.drivers ? (
              React.createElement(React.Fragment, null,
                mockRaceData.drivers.map((driver) => (
                  React.createElement('div', {
                    key: driver.position,
                    className: "flex items-center justify-between py-0.5"
                  },
                  React.createElement('div', {
                      className: "flex items-center gap-2"
                  },
                    // Left box - Position
                    React.createElement('div', {
                      className: "font-bold w-4 text-center",
                    }, driver.position),
                    
                    // Team color line
                    React.createElement('div', {
                      style: { height: 'stretch', width: '5px', backgroundColor: driver.teamColor }
                    }),
                    // Name
                    React.createElement('div', {
                        className: "font-bold",
                    }, 
                      driver.shortName,
                    ),
                  ),
                   
                    
                    
                    // Right box - Driver info
                    React.createElement('div', {
                      className: "flex items-center",
                      style: { marginLeft: 'auto' }
                    },
                     
                      
                      
                      // Driver time and tire
                      React.createElement('div', {
                        className: " font-bold flex items-center gap-2"
                      },
                             mockRaceData.sessionType === 'RACE' 
                          ? (driver.position === 1 ? 'Out Lap' : driver.gapToLeader)
                          : mockRaceData.sessionType === 'QUALY' || mockRaceData.sessionType === 'TRAINING'
                            ? (driver.position === 1 
                                ? `${driver.bestLapTime} Lap ${driver.bestLapTime}`
                                : driver.gapToLeader)
                            : driver.gapToLeader),
                        React.createElement('span', {
                          className: "ml-2",
                          style: { 
                            color: driver.tire === 'SOFT' ? '#FF0000' : 
                                   driver.tire === 'MEDIUM' ? '#FFFF00' : 
                                   driver.tire === 'HARD' ? '#FFFFFF' : 
                                   driver.tire === 'INTERMEDIATE' ? '#00FF00' : 
                                   driver.tire === 'WET' ? '#0000FF' : '#FF232B'
                          }
                        }, 
                          driver.tire === 'SOFT' ? 'S' : 
                          driver.tire === 'MEDIUM' ? 'M' : 
                          driver.tire === 'HARD' ? 'H' : 
                          driver.tire === 'INTERMEDIATE' ? 'I' : 'W'
                        )
                      )
                    )
                  )
                ))
              ) : (
                React.createElement('p', { className: "text-gray-400 text-center" }, 'Aguardando dados dos pilotos...')
              )
            )
          ),
        
        // Chat section (top right)
        React.createElement('div', {
          style: { gridArea: 'chat', backgroundColor: '#1E1E1E', outline: '8px solid #FF232B' },
          className: "p-4"
        },
          React.createElement('h2', { className: "text-xl font-semibold mb-4" }, 'Chat'),
          React.createElement('div', { className: "space-y-4" },
            // Messages area
            React.createElement('div', { 
              className: "bg-gray-700 rounded-lg p-4 h-48 overflow-y-auto mb-4" 
            },
              messages.length === 0 ? (
                React.createElement('p', { className: "text-gray-400 text-center" }, 'No messages yet...')
              ) : (
                messages.map((msg, index) => (
                  React.createElement('div', { 
                    key: index,
                    className: "mb-2 p-2 bg-gray-600 rounded"
                  },
                    React.createElement('div', { className: "font-semibold text-blue-400 text-sm" }, msg.player),
                    React.createElement('div', { className: "text-gray-200 text-sm" }, msg.message)
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
        ),
        
        // Race Info section (top right corner)
        React.createElement('div', {
          style: { gridArea: 'race-info', backgroundColor: '#1E1E1E', outline: '8px solid #FF232B' },
          className: "p-4"
        },
          React.createElement('h2', { className: "text-xl font-semibold mb-4" }, 'Info Corrida'),
          React.createElement('div', { className: "space-y-2 text-sm" },
            React.createElement('div', null, 'Volta: 23/52'),
            React.createElement('div', null, 'Bandeira: 🟢 Verde'),
            React.createElement('div', null, 'Tempo: 45:23'),
            React.createElement('div', null, 'Temperatura: 23°C'),
            React.createElement('div', null, 'Umidade: 65%')
          )
        ),
        
        // Map section (bottom right, spans 2 columns)
        React.createElement('div', {
          style: { gridArea: 'map', backgroundColor: '#1E1E1E', outline: '8px solid #FF232B' },
          className: "p-4"
        },
          React.createElement('h2', { className: "text-xl font-semibold mb-4" }, 'Mapa Ao Vivo'),
          React.createElement('div', { 
            className: "relative bg-gray-700 rounded-lg mx-auto",
            style: { 
              width: '100%', 
              height: '300px',
              position: 'relative'
            }
          },
            // Map grid lines
            React.createElement('div', { 
              className: "absolute inset-0 pointer-events-none",
              style: {
                backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
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
            // Coordinate labels
            React.createElement('div', {
              className: "absolute text-xs text-gray-400 pointer-events-none",
              style: { left: '5px', top: '5px' }
            }, '(5000, 5000)'),
            React.createElement('div', {
              className: "absolute text-xs text-gray-400 pointer-events-none",
              style: { right: '5px', top: '5px' }
            }, '(-5000, 5000)'),
            React.createElement('div', {
              className: "absolute text-xs text-gray-400 pointer-events-none",
              style: { left: '5px', bottom: '5px' }
            }, '(5000, -5000)'),
            React.createElement('div', {
              className: "absolute text-xs text-gray-400 pointer-events-none",
              style: { right: '5px', bottom: '5px' }
            }, '(-5000, -5000)'),
            // Player dots
            playerList && playerList.players.map((player: PlayerData) => {
              // Convert Haxball coordinates to map coordinates
              const mapX = 50 + (player.position.x * 0.01); // 50 is center of 100px width
              const mapY = 50 + (player.position.y * 0.01); // 50 is center of 100px height, Y positive goes up
              
              return React.createElement('div', {
                key: player.id,
                className: `absolute w-2 h-2 rounded-full ${
                  player.team === 0 ? 'bg-red-500' : 
                  player.team === 1 ? 'bg-blue-500' : 'bg-gray-500'
                }`,
                style: {
                  left: `${mapX}%`,
                  top: `${mapY}%`,
                  transform: 'translate(-50%, -50%)', // Center dot on position
                  boxShadow: player.admin ? '0 0 5px rgba(147, 51, 234, 0.8)' : 'none'
                },
                title: `${player.name} (${Math.round(player.position.x)}, ${Math.round(player.position.y)})`
              });
            })
          )
        )
      )
    )
  );
}

export default function PitWallPage() {
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

  return React.createElement(ProtectedPitWall);
}
