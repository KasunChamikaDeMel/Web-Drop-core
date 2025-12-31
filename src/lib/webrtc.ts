import Peer from 'simple-peer';
import type { Instance, SignalData } from 'simple-peer';
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
  private peer: Instance | null = null;
  private roomId: string;
  private isInitiator: boolean;
  private callbacks: TransferCallbacks;
  private receivingFile: {
    metadata: FileMetadata;
    chunks: Uint8Array[];
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

      try {
        this.peer = new Peer({
          initiator: this.isInitiator,
          trickle: true,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
              { urls: 'stun:stun3.l.google.com:19302' },
              { urls: 'stun:stun4.l.google.com:19302' },
            ],
            iceCandidatePoolSize: 10,
          },
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create peer';
        this.callbacks.onError(errorMsg);
        reject(err);
        return;
      }

      const timeout = setTimeout(() => {
        console.error('WebRTC connection timeout after 10 seconds');
        this.callbacks.onError('Connection timeout - please try again');
        reject(new Error('Connection timeout'));
      }, 10000);

      this.peer.on('signal', (data: SignalData) => {
        console.log('WebRTC signal data:', data.type);
        socket.emit('signal', { roomId: this.roomId, signal: data });
      });

      this.peer.on('connect', () => {
        clearTimeout(timeout);
        console.log('Peer connected successfully');
        resolve();
      });

      this.peer.on('data', (data: ArrayBuffer) => {
        console.log('Received data:', data.byteLength, 'bytes');
        this.handleIncomingData(data);
      });

      this.peer.on('error', (err: Error) => {
        clearTimeout(timeout);
        console.error('Peer connection error:', err);
        this.callbacks.onError(err.message || 'Connection failed');
        reject(err);
      });

      this.peer.on('close', () => {
        console.log('Peer connection closed');
      });

      this.peer.on('iceStateChange', (state: string) => {
        console.log('ICE state changed to:', state);
      });

      socket.on('signal', ({ signal }: { signal: SignalData }) => {
        if (this.peer && !this.peer.destroyed) {
          try {
            this.peer.signal(signal);
          } catch (err) {
            console.error('Error handling signal:', err);
          }
        }
      });
    });
  }

  private handleIncomingData(data: ArrayBuffer): void {
    try {
      // Try to parse as JSON for control messages
      if (data.byteLength < 1024) {
        try {
          const text = new TextDecoder().decode(data);
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
              const blob = new Blob(this.receivingFile.chunks as BlobPart[], { 
                type: this.receivingFile.metadata.type 
              });
              this.callbacks.onFileComplete(this.receivingFile.metadata.id, blob);
              this.receivingFile = null;
            }
            return;
          }
        } catch (e) {
          // Not JSON, treat as file chunk
        }
      }

      // Handle file chunk
      if (this.receivingFile) {
        this.receivingFile.chunks.push(new Uint8Array(data));
        this.receivingFile.receivedSize += data.byteLength;
        
        const progress = (this.receivingFile.receivedSize / this.receivingFile.metadata.size) * 100;
        const elapsed = (Date.now() - this.receivingFile.startTime) / 1000;
        const speed = this.receivingFile.receivedSize / elapsed / (1024 * 1024);
        
        this.callbacks.onProgress(this.receivingFile.metadata.id, progress, speed);
      }
    } catch (err) {
      console.error('Error handling incoming data:', err);
      this.callbacks.onError('Error processing received data');
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
    const startMessage = JSON.stringify({ type: 'file-start', metadata });
    this.peer.send(startMessage);

    // Wait for message to be sent
    await new Promise(resolve => setTimeout(resolve, 100));

    // Read and send file in chunks
    const arrayBuffer = await file.arrayBuffer();
    let offset = 0;
    const startTime = Date.now();

    while (offset < arrayBuffer.byteLength) {
      const chunk = arrayBuffer.slice(offset, offset + CHUNK_SIZE);
      
      // Check buffer - use _channel property safely
      const bufferAmount = (this.peer as any)._channel?.bufferedAmount || 0;
      while (bufferAmount > CHUNK_SIZE * 10) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      this.peer.send(new Uint8Array(chunk));
      offset += chunk.byteLength;

      const progress = (offset / arrayBuffer.byteLength) * 100;
      const elapsed = (Date.now() - startTime) / 1000;
      const speed = offset / elapsed / (1024 * 1024);

      this.callbacks.onProgress(fileId, progress, speed);
    }

    // Wait for buffer to drain
    let bufferAmount = (this.peer as any)._channel?.bufferedAmount || 0;
    while (bufferAmount > 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
      bufferAmount = (this.peer as any)._channel?.bufferedAmount || 0;
    }

    // Send file end message
    const endMessage = JSON.stringify({ type: 'file-end', fileId });
    this.peer.send(endMessage);
  }

  destroy(): void {
    if (this.peer) {
      try {
        this.peer.destroy();
      } catch (err) {
        console.error('Error destroying peer:', err);
      }
      this.peer = null;
    }
    this.receivingFile = null;
  }

  isConnected(): boolean {
    return this.peer !== null && !this.peer.destroyed && (this.peer as any).connected === true;
  }
}