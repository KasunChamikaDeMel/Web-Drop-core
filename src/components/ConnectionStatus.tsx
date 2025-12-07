import { Loader2, CheckCircle2, XCircle, Wifi, Send } from 'lucide-react';
import type { ConnectionStatus as Status } from '@/store/useTransferStore';

interface ConnectionStatusProps {
  status: Status;
  peerInfo?: string | null;
}

export const ConnectionStatus = ({ status, peerInfo }: ConnectionStatusProps) => {
  const statusConfig = {
    idle: {
      icon: Wifi,
      text: 'Ready to connect',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    connecting: {
      icon: Loader2,
      text: 'Waiting for connection...',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      animate: true,
    },
    connected: {
      icon: CheckCircle2,
      text: peerInfo ? `Connected to ${peerInfo}` : 'Connected',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    transferring: {
      icon: Send,
      text: 'Transferring files...',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      animate: true,
    },
    completed: {
      icon: CheckCircle2,
      text: 'Transfer complete!',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    error: {
      icon: XCircle,
      text: 'Connection failed',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const shouldAnimate = 'animate' in config && config.animate;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-full ${config.bgColor} animate-fade-in`}>
      <div className="relative">
        <Icon className={`w-5 h-5 ${config.color} ${shouldAnimate ? 'animate-spin' : ''}`} />
        {status === 'connecting' && (
          <div className="absolute inset-0 rounded-full animate-pulse-ring bg-primary/30" />
        )}
      </div>
      <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
};
