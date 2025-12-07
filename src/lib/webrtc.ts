import Peer from 'simple-peer';
import { getSocket } from './socket';

const CHUNK_SIZE = 64 * 1024; // 64KB chunks

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface TransferCallbacks {
  onFileStart: (metadata: FileMetadata) => void;
  onProgress: (fileId: string, progress: number, speed: number) => void;
  onFileComplete: (fileId: string, blob: Blob) => void;
  onError: (error: string) => void;
}

export class WebRTCTransfer {
  private peer: Peer.Instance | null = null;
  private roomId: string;
  private isInitiator: boolean;
  private callbacks: TransferCallbacks;
  private receivingFile: {
    metadata: FileMetadata;
    chunks: ArrayBuffer[];
    receivedSize: number;
    startTime: number;
  } | null = null;

  constructor(roomId: string, isInitiator: boolean, callbacks: TransferCallbacks) {
    this.roomId = roomId;
    this.isInitiator = isInitiator;
    this.callbacks = callbacks;
  }

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = getSocket();

      this.peer = new Peer({
        initiator: this.isInitiator,
        trickle: false,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        },
      });

      this.peer.on('signal', (data) => {
        socket.emit('signal', { roomId: this.roomId, signal: data });
      });

      this.peer.on('connect', () => {
        console.log('Peer connected!');
        resolve();
      });

      this.peer.on('data', (data) => {
        this.handleIncomingData(data);
      });

      this.peer.on('error', (err) => {
        console.error('Peer error:', err);
        this.callbacks.onError(err.message);
        reject(err);
      });

      this.peer.on('close', () => {
        console.log('Peer connection closed');
      });

      socket.on('signal', ({ signal }) => {
        if (this.peer && !this.peer.destroyed) {
          this.peer.signal(signal);
        }
      });
    });
  }

  private handleIncomingData(data: ArrayBuffer | Uint8Array) {
    // Convert to ArrayBuffer if needed
    const buffer = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    
    // Check if it's metadata (JSON string)
    try {
      const text = new TextDecoder().decode(buffer);
      const parsed = JSON.parse(text);
      
      if (parsed.type === 'file-start') {
        this.receivingFile = {
          metadata: parsed.metadata,
          chunks: [],
          receivedSize: 0,
          startTime: Date.now(),
        };
        this.callbacks.onFileStart(parsed.metadata);
        return;
      }
      
      if (parsed.type === 'file-end') {
        if (this.receivingFile) {
          const blob = new Blob(this.receivingFile.chunks, { type: this.receivingFile.metadata.type });
          this.callbacks.onFileComplete(this.receivingFile.metadata.id, blob);
          this.receivingFile = null;
        }
        return;
      }
    } catch {
      // Not JSON, must be file chunk
    }

    // Handle file chunk
    if (this.receivingFile) {
      this.receivingFile.chunks.push(buffer);
      this.receivingFile.receivedSize += buffer.byteLength;
      
      const progress = (this.receivingFile.receivedSize / this.receivingFile.metadata.size) * 100;
      const elapsed = (Date.now() - this.receivingFile.startTime) / 1000;
      const speed = this.receivingFile.receivedSize / elapsed / (1024 * 1024); // MB/s
      
      this.callbacks.onProgress(this.receivingFile.metadata.id, progress, speed);
    }
  }

  async sendFile(file: File, fileId: string): Promise<void> {
    if (!this.peer || this.peer.destroyed) {
      throw new Error('Peer connection not established');
    }

    const metadata: FileMetadata = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
    };

    // Send file start message
    this.peer.send(JSON.stringify({ type: 'file-start', metadata }));

    // Send file in chunks
    const arrayBuffer = await file.arrayBuffer();
    let offset = 0;
    const startTime = Date.now();

    while (offset < arrayBuffer.byteLength) {
      const chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE);
      
      // Wait for the buffer to drain if needed
      while (this.peer.bufferSize > CHUNK_SIZE * 10) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      this.peer.send(new Uint8Array(chunk as ArrayBuffer));
      offset += chunk.byteLength;

      const progress = (offset / arrayBuffer.byteLength) * 100;
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = offset / elapsed / (1024 * 1024); // MB/s

      this.callbacks.onProgress(fileId, progress, speed);
    }

    // Send file end message
    this.peer.send(JSON.stringify({ type: 'file-end', fileId }));
  }

  destroy() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }

  isConnected(): boolean {
    return this.peer !== null && !this.peer.destroyed && this.peer.connected;
  }
}
