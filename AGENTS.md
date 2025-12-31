# AGENTS.md

## Build & Test Commands

- **`npm run dev`** - Start dev server (port 8080)
- **`npm run build`** - Production build
- **`npm run lint`** - Run ESLint (no broken import alias, strict unused var rules disabled)
- **`npm run preview`** - Preview production build locally
- **Server start**: `cd server && npm start` (runs on port 3001)

## Architecture

**Web-Drop** is a peer-to-peer file transfer app with two parts:

- **Frontend** (`src/`): React 18 + TypeScript + Vite. Entry point: `src/main.tsx`
- **Signaling Server** (`server/`): Node.js + Express + Socket.IO. Routes P2P setup via WebSocket, then files transfer directly peer-to-peer using WebRTC

**Directory structure**:
- `src/components/` - React components (UI from shadcn/ui + custom)
- `src/pages/` - Page routes (Index, Receive, Send, Room, NotFound)
- `src/hooks/` - Custom hooks (useTheme, useWakeLock, useMobile, useToast)
- `src/lib/` - Core utilities (socket.ts for Socket.IO, webrtc.ts for WebRTC, utils.ts)
- `src/store/` - Zustand state (useTransferStore)
- `server/signaling-server.js` - WebRTC signaling relay + room management

## Code Style & Conventions

- **Language**: TypeScript (both frontend & server)
- **Imports**: Use `@/` alias for src imports (configured in vite.config.ts). Relative imports for local components.
- **Components**: Functional components, arrow functions. Export default for pages, named exports for reusables.
- **State**: Zustand for global state, React hooks for local
- **Styling**: Tailwind CSS + CSS modules. Dark mode via class-based switching
- **Formatting**: ESLint flat config (no strict null/unused rules enforced). Format on save recommended.
- **Types**: Loose TypeScript (`noImplicitAny: false`, `strictNullChecks: false`). Use interfaces for data structures.
- **Error handling**: Use Sonner toast for user feedback. Console.log for debug.
- **Environment**: `VITE_SIGNALING_SERVER_URL` for server endpoint (frontend only)
