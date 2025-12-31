import { io, Socket } from 'socket.io-client';

// Replace this with your deployed signaling server URL
const SIGNALING_SERVER_URL = 'https://web-drop-signaling.yourusername.repl.co'; // Update with your Replit URL

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
    
    console.log('Socket connected status:', s.connected);
    
    if (s.connected) {
      console.log('Socket already connected');
      resolve();
      return;
    }
    
    console.log('Attempting to connect socket...');
    s.connect();
    
    s.once('connect', () => {
      console.log('Connected to signaling server successfully');
      resolve();
    });
    
    s.once('connect_error', (error) => {
      console.error('Socket connection error:', error);
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
