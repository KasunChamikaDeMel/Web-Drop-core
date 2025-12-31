import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RoomCodeInput } from '@/components/RoomCodeInput';
import { Button } from '@/components/ui/button';
import { ArrowLeft, QrCode } from 'lucide-react';

const Send = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (code: string) => {
    console.log('Room code submitted:', code);
    if (!code || code.trim().length === 0) {
      console.error('Empty room code provided');
      return;
    }
    setIsLoading(true);
    navigate(`/room/${code.trim().toUpperCase()}`);
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
              Enter the room code displayed on the receiving device
            </p>
          </div>

          <div className="flex justify-center">
            <RoomCodeInput onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <QrCode className="w-5 h-5" />
              <span>Scan QR code with your camera</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Open your phone's camera and point it at the QR code on the receiving device.
              It will automatically open this page with the room code.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Send;
