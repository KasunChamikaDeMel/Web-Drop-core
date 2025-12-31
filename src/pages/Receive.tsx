import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { TransferProgress } from '@/components/TransferProgress';
import { useTransferStore } from '@/store/useTransferStore';
import { useWakeLock } from '@/hooks/useWakeLock';
import { connectSocket, getSocket, generateRoomId, disconnectSocket, testHttpConnection } from '@/lib/socket';
import { WebRTCTransfer } from '@/lib/webrtc';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const Receive = () => {
  const navigate = useNavigate();
  const webrtcRef = useRef<WebRTCTransfer | null>(null);
  const isInitializingRef = useRef(false);
  
  const {
    roomId,
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

  const isTransferring = connectionStatus === 'transferring' || connectionStatus === 'connected';
  useWakeLock(isTransferring);

  const initializeRoom = useCallback(async () => {
    // Prevent re-initialization if already has a room or is currently initializing
    if (roomId || isInitializingRef.current) {
      console.log('Room already exists or initializing, skipping');
      return;
    }
    
    isInitializingRef.current = true;
    reset();
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setIsHost(true);
    setConnectionStatus('connecting');

    try {
      await connectSocket();
      const socket = getSocket();

      socket.emit('create-room', { roomId: newRoomId });
      console.log('Created room:', newRoomId);

      // Clean up any existing listeners
      socket.off('peer-joined');
      socket.off('peer-left');

      console.log('Setting up peer-joined listener for room:', newRoomId);
      socket.on('peer-joined', async () => {
        console.log('Peer joined the room, initializing WebRTC');
        
        try {
          webrtcRef.current = new WebRTCTransfer(newRoomId, true, {
            onFileStart: (metadata) => {
              console.log('File transfer started:', metadata.name);
              addFile({
                id: metadata.id,
                name: metadata.name,
                size: metadata.size,
                type: metadata.type,
                progress: 0,
                status: 'transferring',
              });
              setConnectionStatus('transferring');
            },
            onProgress: (fileId, progress, speed) => {
              updateFileProgress(fileId, progress);
              setTransferSpeed(speed);
            },
            onFileComplete: (fileId, blob) => {
              console.log('File transfer completed:', fileId);
              updateFileStatus(fileId, 'completed', blob);
              
              // Check if all files are complete
              const currentFiles = useTransferStore.getState().files;
              const allComplete = currentFiles.every(f => f.id === fileId || f.status === 'completed');
              if (allComplete) {
                setConnectionStatus('completed');
                setTransferSpeed(0);
              }
            },
            onError: (error) => {
              console.error('Transfer error:', error);
              setConnectionStatus('error');
            },
          });

          console.log('Initializing WebRTC as initiator');
          await webrtcRef.current.initialize();
          console.log('WebRTC initialized successfully');
          setConnectionStatus('connected');
        } catch (error) {
          console.error('Failed to initialize WebRTC:', error);
          setConnectionStatus('error');
        }
      });

      socket.on('peer-left', () => {
        console.log('Peer left the room');
        // Don't automatically change status - let user handle it
      });

    } catch (error) {
      console.error('Failed to initialize room:', error);
      setConnectionStatus('error');
    } finally {
      isInitializingRef.current = false;
    }
  }, [reset, setRoomId, setIsHost, setConnectionStatus, addFile, updateFileProgress, updateFileStatus, setTransferSpeed]);

  useEffect(() => {
    initializeRoom();

    return () => {
      webrtcRef.current?.destroy();
      disconnectSocket();
      reset();
    };
  }, []); // Empty dependency array - run only once on mount

  const roomUrl = roomId ? `${window.location.origin}/room/${roomId}` : '';

  const handleNewRoom = () => {
    webrtcRef.current?.destroy();
    disconnectSocket();
    isInitializingRef.current = false; // Reset for new room
    initializeRoom();
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
            <h1 className="text-2xl font-bold">Receive Files</h1>
            <p className="text-muted-foreground">
              Scan the QR code or enter the room code on another device
            </p>
          </div>

          <div className="flex justify-center">
            <ConnectionStatus status={connectionStatus} />
          </div>

          {roomId && connectionStatus === 'connecting' && (
            <QRCodeDisplay roomId={roomId} roomUrl={roomUrl} />
          )}

          {(connectionStatus === 'connected' || connectionStatus === 'transferring' || connectionStatus === 'completed') && (
            <TransferProgress
              files={files}
              transferSpeed={transferSpeed}
              isReceiver={true}
            />
          )}

          {connectionStatus === 'completed' && (
            <div className="flex justify-center">
              <Button onClick={handleNewRoom} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Create New Room
              </Button>
            </div>
          )}

          {connectionStatus === 'error' && (
            <div className="text-center space-y-4">
              <p className="text-destructive">Failed to connect. Please try again.</p>
              <Button onClick={handleNewRoom}>
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

export default Receive;
