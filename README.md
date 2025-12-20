

# Web-Drop Core 🚀

A modern, peer-to-peer file transfer application built with React, WebRTC, and Socket.IO. Transfer files securely between devices without uploading to any server - files go directly from sender to receiver.

<img width="1918" height="978" alt="image" src="https://github.com/user-attachments/assets/87e56f39-9b3d-4534-a96f-1d24a4d003d9" />

## ✨ Features

- **Peer-to-Peer Transfer**: Files transfer directly between devices using WebRTC
- **No File Size Limits**: Transfer files of any size (limited only by browser memory)
- **Real-time Progress**: Live transfer speed and progress tracking
- **QR Code Sharing**: Easy room joining via QR code scanning
- **Multiple File Support**: Send multiple files in one session
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode Support**: Built-in theme switching
- **Wake Lock**: Prevents device sleep during transfers
- **Secure**: End-to-end encrypted connections via WebRTC

## 🏗️ Architecture

The application consists of two parts:

1. **Frontend (React + Vite)**: The main application UI and WebRTC client
2. **Signaling Server (Node.js + Express + Socket.IO)**: Facilitates initial peer connection setup

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Sender    │◄───────►│ Signaling Server │◄───────►│  Receiver   │
│  (Browser)  │         │    (Node.js)     │         │  (Browser)  │
└─────────────┘         └──────────────────┘         └─────────────┘
       │                                                      │
       │                WebRTC Direct Connection             │
       └──────────────────────────────────────────────────────┘
                        (File Transfer)
```

## 📋 Prerequisites

- Node.js 18+ and npm
- A modern web browser (Chrome, Firefox, Safari, Edge)
- For production: A hosting service for the signaling server (Render, Railway, Fly.io, etc.)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/web-drop-core.git
cd web-drop-core
```

### 2. Setup the Frontend

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and set your signaling server URL
# For local development, use: VITE_SIGNALING_SERVER_URL=http://localhost:3001
```

### 3. Setup the Signaling Server

```bash
cd server

# Install dependencies
npm install

# Start the server
npm start
```

The signaling server will run on `http://localhost:3001` by default.

### 4. Start the Frontend

```bash
# In the root directory
npm run dev
```

The application will be available at `http://localhost:8080`

## 📦 Project Structure

```
web-drop-core/
├── server/                      # Signaling server
│   ├── signaling-server.js      # WebSocket server for peer signaling
│   └── package.json
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── ConnectionStatus.tsx # Connection status indicator
│   │   ├── FileDropzone.tsx     # File selection component
│   │   ├── Header.tsx           # App header
│   │   ├── QRCodeDisplay.tsx    # QR code generator
│   │   ├── RoomCodeInput.tsx    # Room code entry
│   │   └── TransferProgress.tsx # Progress tracking
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.tsx       # Mobile detection
│   │   ├── use-toast.ts         # Toast notifications
│   │   ├── useTheme.ts          # Theme management
│   │   └── useWakeLock.ts       # Screen wake lock
│   ├── lib/                     # Core utilities
│   │   ├── socket.ts            # Socket.IO client setup
│   │   ├── utils.ts             # Helper functions
│   │   └── webrtc.ts            # WebRTC connection handling
│   ├── pages/                   # Route pages
│   │   ├── Index.tsx            # Landing page
│   │   ├── Receive.tsx          # Receive files page
│   │   ├── Send.tsx             # Send files page
│   │   ├── Room.tsx             # Transfer room
│   │   └── NotFound.tsx         # 404 page
│   ├── store/                   # State management
│   │   └── useTransferStore.ts  # Zustand store
│   ├── App.tsx                  # Main app component
│   └── main.tsx                 # Entry point
├── .env                         # Environment variables
├── package.json
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS config
└── tsconfig.json                # TypeScript config
```

## 🔒 Security Considerations

- All file transfers are peer-to-peer and encrypted via WebRTC (DTLS/SRTP)
- Files never touch the signaling server
- Room codes expire after 1 hour of inactivity
- No file data is logged or stored
- STUN servers are used only for NAT traversal

## 🐛 Troubleshooting

### Connection Issues

1. **"Connection timeout"**
   - Verify the signaling server is running
   - Check your `.env` file has the correct server URL
   - Ensure firewall isn't blocking WebSocket connections

2. **"Room not found"**
   - Room codes expire after 1 hour
   - Verify the room code is entered correctly
   - Try creating a new room

3. **Slow transfer speeds**
   - Check your network connection
   - Try closing other applications using bandwidth
   - Both devices should have stable connections

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 14.3+)
- Opera: Full support

### HTTPS Requirement

WebRTC requires HTTPS in production. Ensure both your frontend and signaling server use HTTPS.

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Routing**: React Router v6
- **WebRTC**: simple-peer
- **Real-time**: Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO

## 📝 How It Works

1. **Receiver Creates Room**:
   - Opens `/receive` page
   - App generates a unique 6-character room code
   - Connects to signaling server and creates room
   - Displays QR code and room code

2. **Sender Joins Room**:
   - Scans QR code or enters room code manually
   - Connects to signaling server
   - Joins the room

3. **WebRTC Connection**:
   - Peers exchange ICE candidates via signaling server
   - Direct peer-to-peer connection established
   - Signaling server is no longer needed

4. **File Transfer**:
   - Sender selects files
   - Files are split into 64KB chunks
   - Chunks sent directly to receiver via WebRTC data channel
   - Real-time progress tracking
   - Files automatically downloaded on completion

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [simple-peer](https://github.com/feross/simple-peer) - WebRTC wrapper
- [Socket.IO](https://socket.io/) - Real-time communication
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Icon library

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Read the troubleshooting section

## 🗺️ Roadmap

- [ ] Add password protection for rooms
- [ ] Implement file compression
- [ ] Add transfer history
- [ ] Support for folder transfers
- [ ] Add chat functionality
- [ ] Mobile app versions (React Native)
- [ ] Add TURN server support for better connectivity

---

**⚡ Start transferring files the modern way!**
