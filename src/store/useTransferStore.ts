import { create } from 'zustand';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'transferring' | 'completed' | 'error';

export interface FileTransfer {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'transferring' | 'completed' | 'error';
  blob?: Blob;
}

interface TransferState {
  roomId: string | null;
  roomPassword: string | null;
  connectionStatus: ConnectionStatus;
  isHost: boolean;
  peerDeviceInfo: string | null;
  files: FileTransfer[];
  transferSpeed: number;
  errorMessage: string | null;
  
  setRoomId: (roomId: string | null) => void;
  setRoomPassword: (password: string | null) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setIsHost: (isHost: boolean) => void;
  setPeerDeviceInfo: (info: string | null) => void;
  addFile: (file: FileTransfer) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (id: string, status: FileTransfer['status'], blob?: Blob) => void;
  setTransferSpeed: (speed: number) => void;
  setErrorMessage: (message: string | null) => void;
  clearFiles: () => void;
  reset: () => void;
}

const initialState = {
  roomId: null,
  roomPassword: null,
  connectionStatus: 'idle' as ConnectionStatus,
  isHost: false,
  peerDeviceInfo: null,
  files: [],
  transferSpeed: 0,
  errorMessage: null,
};

export const useTransferStore = create<TransferState>((set) => ({
  ...initialState,
  
  setRoomId: (roomId) => set({ roomId }),
  setRoomPassword: (roomPassword) => set({ roomPassword }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setIsHost: (isHost) => set({ isHost }),
  setPeerDeviceInfo: (peerDeviceInfo) => set({ peerDeviceInfo }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFileProgress: (id, progress) => set((state) => ({
    files: state.files.map((f) => f.id === id ? { ...f, progress } : f),
  })),
  updateFileStatus: (id, status, blob) => set((state) => ({
    files: state.files.map((f) => f.id === id ? { ...f, status, blob: blob ?? f.blob } : f),
  })),
  setTransferSpeed: (transferSpeed) => set({ transferSpeed }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  clearFiles: () => set({ files: [] }),
  reset: () => set(initialState),
}));
