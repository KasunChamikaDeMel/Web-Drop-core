import { io, Socket } from 'socket.io-client';

// Replace this with your deployed signaling server URL
const SIGNALING_SERVER_URL = import.meta.env.VITE_SIGNALING_SERVER_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SIGNALING_SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const s = getSocket();
    
    if (s.connected) {
      resolve();
      return;
    }
    
    s.connect();
    
    s.once('connect', () => {
      console.log('Connected to signaling server');
      resolve();
    });
    
    s.once('connect_error', (error) => {
      console.error('Connection error:', error);
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
