import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UpAxis } from '@/types/viewer';

interface AxisSelectorProps {
  selectedAxis: UpAxis;
  detectedAxis: UpAxis | null;
  onSelect: (axis: UpAxis) => void;
}

const axes: UpAxis[] = ['X', 'Y', 'Z'];

export function AxisSelector({ selectedAxis, detectedAxis, onSelect }: AxisSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        🧭 Up Axis
      </h3>
      
      <div className="flex gap-2">
        {axes.map((axis) => (
          <Button
            key={axis}
            variant="secondary"
            size="sm"
            onClick={() => onSelect(axis)}
            className={cn(
              "flex-1 text-xs font-medium transition-all duration-200",
              selectedAxis === axis && "toggle-active text-primary-foreground"
            )}
          >
            {axis}
            {detectedAxis === axis && (
              <span className="ml-1 text-[10px] opacity-70">(detected)</span>
            )}
          </Button>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Model orientation
      </p>
    </div>
  );
}
