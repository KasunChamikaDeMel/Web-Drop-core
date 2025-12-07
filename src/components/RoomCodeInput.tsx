import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';

interface RoomCodeInputProps {
  onSubmit: (code: string) => void;
  isLoading?: boolean;
}

export const RoomCodeInput = ({ onSubmit, isLoading }: RoomCodeInputProps) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onSubmit(code.toUpperCase());
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Enter room code
        </label>
        <Input
          value={code}
          onChange={handleChange}
          placeholder="XXXXXX"
          className="text-center text-2xl font-mono tracking-widest h-14"
          maxLength={6}
          autoFocus
        />
      </div>
      <Button
        type="submit"
        className="w-full h-12"
        disabled={code.length !== 6 || isLoading}
      >
        {isLoading ? 'Connecting...' : 'Join Room'}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </form>
  );
};
