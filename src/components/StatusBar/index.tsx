import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewerState } from '@/types/viewer';

interface StatusBarProps {
  visible: boolean;
  viewerState: ViewerState;
}

export function StatusBar({ visible, viewerState }: StatusBarProps) {
  const { statusMessage, statusType, isLoading } = viewerState;

  const getIcon = () => {
    switch (statusType) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin mr-2" />;
      case 'error':
        return <span className="mr-2">❌</span>;
      case 'success':
        return <span className="mr-2">✅</span>;
      default:
        return <span className="mr-2">📂</span>;
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-medium",
        "bg-secondary/90 backdrop-blur-sm shadow-xl z-20 flex items-center",
        "transition-panel",
        !visible && "opacity-0 pointer-events-none translate-y-4",
        statusType === 'error' && "text-destructive"
      )}
    >
      {getIcon()}
      {statusMessage}
    </div>
  );
}
