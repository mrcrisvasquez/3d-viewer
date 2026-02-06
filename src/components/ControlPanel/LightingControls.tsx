import React from 'react';
import { Slider } from '@/components/ui/slider';
import type { LightingSettings } from '@/types/viewer';

interface LightingControlsProps {
  settings: LightingSettings;
  onUpdate: (settings: Partial<LightingSettings>) => void;
}

export function LightingControls({ settings, onUpdate }: LightingControlsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
        💡 Lighting
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Environment Rotation</span>
            <span>{settings.envRotation}°</span>
          </div>
          <Slider
            value={[settings.envRotation]}
            min={0}
            max={360}
            step={1}
            onValueChange={([value]) => onUpdate({ envRotation: value })}
            className="w-full"
          />
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Exposure</span>
            <span>{settings.exposure.toFixed(1)}</span>
          </div>
          <Slider
            value={[settings.exposure]}
            min={0}
            max={10}
            step={0.1}
            onValueChange={([value]) => onUpdate({ exposure: value })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
