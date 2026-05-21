// Frontend environment configuration
export const config = {
  // API Configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  
  // Application Configuration
  appName: 'FTOH Haxball Bot',
  version: '1.0.0',
  
  // Feature Flags
  enableDebugMode: process.env.NODE_ENV === 'development',
  enableAnalytics: process.env.NODE_ENV === 'production',
  
  // UI Configuration
  maxMessages: 100,
  messageTimeout: 5000,
  
  // Reconnection Configuration
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  
  // Security
  enableCSRF: process.env.NODE_ENV === 'production',
};

// Validate configuration
const validateConfig = () => {
  const requiredEnvVars = ['NEXT_PUBLIC_API_URL'];
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    console.error('Missing required environment variables:', missingVars.join(', '));
  }
};

validateConfig();

export default config;
