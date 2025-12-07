import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  roomId: string;
  roomUrl: string;
}

export const QRCodeDisplay = ({ roomId, roomUrl }: QRCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyRoomCode = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Room code copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRoomUrl = async () => {
    await navigator.clipboard.writeText(roomUrl);
    toast({
      title: 'Copied!',
      description: 'Room URL copied to clipboard',
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      <div className="p-6 bg-white rounded-2xl shadow-lg">
        <QRCodeSVG
          value={roomUrl}
          size={200}
          level="H"
          includeMargin={false}
        />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">Room Code</p>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-mono font-bold tracking-widest">{roomId}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyRoomCode}
            className="rounded-full"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      <Button variant="outline" onClick={copyRoomUrl} className="text-sm">
        Copy Link
      </Button>
    </div>
  );
};
