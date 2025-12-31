import { io, Socket } from 'socket.io-client';

// Replace this with your deployed signaling server URL
const SIGNALING_SERVER_URL = 'https://web-drop-signaling-server--chamikakasun336.replit.app';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    console.log('Creating socket to:', SIGNALING_SERVER_URL);
    socket = io(SIGNALING_SERVER_URL); // Minimal configuration
  }
  return socket;
};

// Test HTTP connection first
export const testHttpConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing HTTP connection to:', SIGNALING_SERVER_URL);
    const response = await fetch(SIGNALING_SERVER_URL);
    const data = await response.json();
    console.log('HTTP test successful:', data);
    return true;
  } catch (error) {
    console.error('HTTP test failed:', error);
    return false;
  }
};

export const connectSocket = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    
    console.log('Socket connected status:', s.connected);

    if (s.connected) {
      console.log('Socket already connected');
      resolve();
      return;
    }

    console.log('Waiting for socket to connect...');

    s.once('connect', () => {
      console.log('Connected to signaling server successfully');
      resolve();
    });
    
    s.once('connect_error', (error) => {
      console.error('Socket connection error details:', error);
      reject(error);
    });
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const generateRoomId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
