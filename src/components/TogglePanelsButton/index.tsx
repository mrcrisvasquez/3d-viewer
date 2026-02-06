import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TogglePanelsButtonProps {
  panelsVisible: boolean;
  onToggle: () => void;
}

export function TogglePanelsButton({ panelsVisible, onToggle }: TogglePanelsButtonProps) {
  return (
    <Button
      onClick={onToggle}
      size="icon"
      className={cn(
        "fixed bottom-4 right-4 h-12 w-12 rounded-full z-30 shadow-2xl",
        "toggle-active hover:opacity-90 transition-all duration-300",
        "hover:scale-110"
      )}
      title={panelsVisible ? 'Hide Panels' : 'Show Panels'}
    >
      {panelsVisible ? (
        <Eye className="h-5 w-5" />
      ) : (
        <EyeOff className="h-5 w-5" />
      )}
    </Button>
  );
}
