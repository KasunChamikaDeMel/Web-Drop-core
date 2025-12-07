import { Download, CheckCircle2, Loader2, FileText, Image, Film } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { FileTransfer } from '@/store/useTransferStore';

interface TransferProgressProps {
  files: FileTransfer[];
  transferSpeed: number;
  isReceiver?: boolean;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  return FileText;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const TransferProgress = ({ files, transferSpeed, isReceiver }: TransferProgressProps) => {
  const downloadFile = (file: FileTransfer) => {
    if (!file.blob) return;
    
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalProgress = files.length > 0
    ? files.reduce((acc, f) => acc + f.progress, 0) / files.length
    : 0;

  const completedFiles = files.filter(f => f.status === 'completed').length;

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* Overall Progress */}
      <div className="p-4 bg-muted/50 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {completedFiles === files.length
              ? 'Transfer Complete!'
              : `Transferring ${completedFiles + 1} of ${files.length}`}
          </span>
          {transferSpeed > 0 && (
            <span className="text-sm text-muted-foreground">
              {transferSpeed.toFixed(1)} MB/s
            </span>
          )}
        </div>
        <Progress value={totalProgress} className="h-2" />
        <p className="text-xs text-muted-foreground text-center">
          {totalProgress.toFixed(0)}% complete
        </p>
      </div>

      {/* Individual Files */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {files.map((file) => {
          const FileIcon = getFileIcon(file.type);
          return (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <FileIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  {file.status === 'transferring' && (
                    <span className="text-xs text-primary">{file.progress.toFixed(0)}%</span>
                  )}
                </div>
                {file.status === 'transferring' && (
                  <Progress value={file.progress} className="h-1 mt-2" />
                )}
              </div>
              <div className="flex items-center">
                {file.status === 'pending' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  </div>
                )}
                {file.status === 'transferring' && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                {file.status === 'completed' && isReceiver && file.blob && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadFile(file)}
                    className="text-success hover:text-success"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                )}
                {file.status === 'completed' && !isReceiver && (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
