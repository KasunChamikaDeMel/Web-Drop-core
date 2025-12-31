// Use global Socket.IO from CDN (same as working debug test)
declare global {
  interface Window {
    io: any;
  }
}

const { io } = window;

type Socket = ReturnType<typeof io>;

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

    // Add timeout
    const timeout = setTimeout(() => {
      console.error('Socket connection timeout after 10 seconds');
      reject(new Error('Socket connection timeout'));
    }, 10000);

    s.once('connect', () => {
      clearTimeout(timeout);
      console.log('Connected to signaling server successfully');
      resolve();
    });
    
    s.once('connect_error', (error) => {
      clearTimeout(timeout);
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
