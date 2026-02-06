import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ToggleStates } from '@/types/viewer';

interface VisualizationTogglesProps {
  toggleStates: ToggleStates;
  onToggle: (layer: keyof ToggleStates) => void;
}

const toggleItems: Array<{
  id: keyof ToggleStates;
  icon: string;
  label: string;
}> = [
  { id: 'surface', icon: '⚪', label: 'White' },
  { id: 'materials', icon: '🎨', label: 'Materials' },
  { id: 'wireframe', icon: '📐', label: 'Wireframe' },
  { id: 'topology', icon: '🔷', label: 'Topology' },
  { id: 'edges', icon: '📏', label: 'Edges' },
  { id: 'bbox', icon: '📦', label: 'BBox' },
];

export function VisualizationToggles({ toggleStates, onToggle }: VisualizationTogglesProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {toggleItems.map(({ id, icon, label }) => (
        <Button
          key={id}
          variant="secondary"
          size="sm"
          onClick={() => onToggle(id)}
          className={cn(
            "justify-start text-xs font-medium transition-all duration-200 px-2 py-1.5 h-auto",
            "hover:bg-secondary/80",
            toggleStates[id] && "toggle-active text-primary-foreground"
          )}
        >
          <span className="mr-1.5 text-sm">{icon}</span>
          {label}
        </Button>
      ))}
    </div>
  );
}
