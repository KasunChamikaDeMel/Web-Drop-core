import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { FileDropzone } from '@/components/FileDropzone';
import { TransferProgress } from '@/components/TransferProgress';
import { useTransferStore } from '@/store/useTransferStore';
import { useWakeLock } from '@/hooks/useWakeLock';
import { connectSocket, getSocket, disconnectSocket } from '@/lib/socket';
import { WebRTCTransfer } from '@/lib/webrtc';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Room = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const webrtcRef = useRef<WebRTCTransfer | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  const {
    connectionStatus,
    files,
    transferSpeed,
    setRoomId,
    setConnectionStatus,
    setIsHost,
    addFile,
    updateFileProgress,
    updateFileStatus,
    setTransferSpeed,
    reset,
  } = useTransferStore();

  const isTransferring = connectionStatus === 'transferring';
  useWakeLock(isTransferring);

  const joinRoom = useCallback(async () => {
    if (!roomId) return;

    reset();
    setRoomId(roomId);
    setIsHost(false);
    setConnectionStatus('connecting');

    try {
      await connectSocket();
      const socket = getSocket();

      socket.emit('join-room', { roomId });

      socket.on('room-not-found', () => {
        toast({
          title: 'Room not found',
          description: 'The room code is invalid or has expired.',
          variant: 'destructive',
        });
        setConnectionStatus('error');
      });

      socket.on('room-joined', async () => {
        console.log('Joined room successfully');
        
        webrtcRef.current = new WebRTCTransfer(roomId, true, {
          onFileStart: (metadata) => {
            addFile({
              id: metadata.id,
              name: metadata.name,
              size: metadata.size,
              type: metadata.type,
              progress: 0,
              status: 'transferring',
            });
          },
          onProgress: (fileId, progress, speed) => {
            updateFileProgress(fileId, progress);
            setTransferSpeed(speed);
          },
          onFileComplete: (fileId) => {
            updateFileStatus(fileId, 'completed');
            
            const currentFiles = useTransferStore.getState().files;
            const allComplete = currentFiles.every(f => f.id === fileId || f.status === 'completed');
            if (allComplete) {
              setConnectionStatus('completed');
              setTransferSpeed(0);
              setIsSending(false);
            }
          },
          onError: (error) => {
            console.error('Transfer error:', error);
            setConnectionStatus('error');
            setIsSending(false);
          },
        });

        await webrtcRef.current.initialize();
        setConnectionStatus('connected');
      });

    } catch (error) {
      console.error('Failed to join room:', error);
      setConnectionStatus('error');
      toast({
        title: 'Connection failed',
        description: 'Could not connect to the signaling server.',
        variant: 'destructive',
      });
    }
  }, [roomId, reset, setRoomId, setIsHost, setConnectionStatus, addFile, updateFileProgress, updateFileStatus, setTransferSpeed, toast]);

  useEffect(() => {
    joinRoom();

    return () => {
      webrtcRef.current?.destroy();
      disconnectSocket();
      reset();
    };
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendFiles = async () => {
    if (!webrtcRef.current?.isConnected() || selectedFiles.length === 0) return;

    setIsSending(true);
    setConnectionStatus('transferring');

    for (const file of selectedFiles) {
      const fileId = `${file.name}-${Date.now()}`;
      addFile({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending',
      });
    }

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileId = useTransferStore.getState().files[i]?.id;
      if (!fileId) continue;

      updateFileStatus(fileId, 'transferring');
      
      try {
        await webrtcRef.current.sendFile(file, fileId);
        updateFileStatus(fileId, 'completed');
      } catch (error) {
        console.error('Failed to send file:', error);
        updateFileStatus(fileId, 'error');
      }
    }

    setConnectionStatus('completed');
    setTransferSpeed(0);
    setIsSending(false);
    setSelectedFiles([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto space-y-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Send Files</h1>
            <p className="text-muted-foreground">
              Room: <span className="font-mono font-bold">{roomId}</span>
            </p>
          </div>

          <div className="flex justify-center">
            <ConnectionStatus status={connectionStatus} />
          </div>

          {connectionStatus === 'connected' && files.length === 0 && (
            <>
              <FileDropzone
                onFilesSelected={handleFilesSelected}
                selectedFiles={selectedFiles}
                onRemoveFile={handleRemoveFile}
                disabled={isSending}
              />

              {selectedFiles.length > 0 && (
                <Button
                  onClick={handleSendFiles}
                  className="w-full h-12"
                  disabled={isSending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                </Button>
              )}
            </>
          )}

          {(connectionStatus === 'transferring' || (connectionStatus === 'completed' && files.length > 0)) && (
            <TransferProgress
              files={files}
              transferSpeed={transferSpeed}
              isReceiver={false}
            />
          )}

          {connectionStatus === 'completed' && files.length > 0 && (
            <div className="text-center space-y-4">
              <p className="text-success font-medium">All files sent successfully!</p>
              <Button onClick={() => navigate('/')} variant="outline">
                Done
              </Button>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="text-center space-y-4">
              <p className="text-destructive">Connection failed. Please try again.</p>
              <Button onClick={() => navigate('/send')}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Room;
