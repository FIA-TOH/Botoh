'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import config from '@/config/environment';

interface ChatMessage {
  player: string;
  message: string;
  timestamp: number;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
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
      }
    };

    on('chat:message', handleChatMessage);

    return () => {
      off('chat:message', handleChatMessage);
    };
  }, [socket, on, off]);

  const sendMessage = () => {
    if (socket && message.trim()) {
      emit('chat:send', { message: message.trim() });
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">FTOH Haxball Bot Chat</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Chat Messages</h2>
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <p className="text-gray-400">No messages yet...</p>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="mb-2">
                  <span className="text-blue-400 font-semibold">{msg.player}:</span>
                  <span className="text-white ml-2">{msg.message}</span>
                </div>
              ))
            )}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
