/**
 * Web-Drop Signaling Server
 * 
 * This is the Node.js signaling server for WebRTC peer connections.
 * Deploy this separately to Render, Railway, Fly.io, or any Node.js host.
 * 
 * Setup:
 * 1. Create a new directory and copy this file
 * 2. Run: npm init -y
 * 3. Run: npm install socket.io express cors
 * 4. Run: node signaling-server.js
 * 5. Set VITE_SIGNALING_SERVER_URL in your Lovable project to your deployed URL
 */

const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["*"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Store active rooms
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Create a new room (receiver/host)
  socket.on('create-room', ({ roomId }) => {
    console.log('Creating room:', roomId);
    
    rooms.set(roomId, {
      hostId: socket.id,
      peerId: null,
      createdAt: Date.now(),
    });
    
    socket.join(roomId);
    socket.roomId = roomId;
    socket.isHost = true;
  });

  // Join an existing room (sender)
  socket.on('join-room', ({ roomId }) => {
    console.log('Joining room:', roomId);
    
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('room-not-found');
      return;
    }
    
    if (room.peerId) {
      socket.emit('room-full');
      return;
    }
    
    room.peerId = socket.id;
    socket.join(roomId);
    socket.roomId = roomId;
    socket.isHost = false;
    
    // Notify the host that a peer has joined
    console.log('Notifying host', room.hostId, 'that peer joined');
    io.to(room.hostId).emit('peer-joined');
    
    // Confirm to the sender that they've joined
    console.log('Confirming to sender', socket.id, 'that room was joined');
    socket.emit('room-joined');
  });

  // Relay WebRTC signaling data
  socket.on('signal', ({ roomId, signal }) => {
    console.log('Signal received for room:', roomId, 'type:', signal?.type);
    const room = rooms.get(roomId);
    
    if (!room) {
      console.log('Room not found for signal:', roomId);
      return;
    }
    
    // Send signal to the other peer
    const targetId = socket.id === room.hostId ? room.peerId : room.hostId;
    
    if (targetId) {
      console.log('Relaying signal to:', targetId);
      io.to(targetId).emit('signal', { signal });
    } else {
      console.log('No target peer found for signal');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      
      if (room) {
        if (socket.isHost) {
          // Host left, destroy room
          rooms.delete(socket.roomId);
          io.to(socket.roomId).emit('room-closed');
        } else {
          // Peer left
          room.peerId = null;
          io.to(room.hostId).emit('peer-left');
        }
      }
    }
  });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

// Clean up old rooms periodically (older than 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  
  for (const [roomId, room] of rooms.entries()) {
    if (room.createdAt < oneHourAgo) {
      rooms.delete(roomId);
      io.to(roomId).emit('room-expired');
    }
  }
}, 60 * 1000);

const PORT = process.env.PORT || 3001;

console.log('Starting server on port:', PORT);

httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
