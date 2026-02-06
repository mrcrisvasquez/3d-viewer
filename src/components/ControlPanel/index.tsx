import React from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { VisualizationToggles } from './VisualizationToggles';
import { LightingControls } from './LightingControls';
import { AxisSelector } from './AxisSelector';
import { FileUpload } from './FileUpload';
import type { ToggleStates, LightingSettings, UpAxis } from '@/types/viewer';
interface ControlPanelProps {
  visible: boolean;
  toggleStates: ToggleStates;
  lightingSettings: LightingSettings;
  selectedAxis: UpAxis;
  detectedAxis: UpAxis | null;
  onToggle: (layer: keyof ToggleStates) => void;
  onLightingUpdate: (settings: Partial<LightingSettings>) => void;
  onAxisSelect: (axis: UpAxis) => void;
  onFilesSelected: (files: FileList) => void;
  onScreenshot: () => void;
}
export function ControlPanel({
  visible,
  toggleStates,
  lightingSettings,
  selectedAxis,
  detectedAxis,
  onToggle,
  onLightingUpdate,
  onAxisSelect,
  onFilesSelected,
  onScreenshot
}: ControlPanelProps) {
  return <div className={cn("glass-panel fixed top-4 left-4 p-4 rounded-xl text-foreground z-10 shadow-2xl", "transition-panel", !visible && "opacity-0 pointer-events-none -translate-x-4")}>
      <h2 className="text-sm font-medium mb-3 flex items-center gap-2">
        <span className="text-lg">🚀</span> 3D Viewer by Cris Vásquez   
      </h2>

      <VisualizationToggles toggleStates={toggleStates} onToggle={onToggle} />

      <Separator className="my-4 bg-border" />

      <LightingControls settings={lightingSettings} onUpdate={onLightingUpdate} />

      <Separator className="my-4 bg-border" />

      <AxisSelector selectedAxis={selectedAxis} detectedAxis={detectedAxis} onSelect={onAxisSelect} />

      <Separator className="my-4 bg-border" />

      <Button onClick={onScreenshot} variant="outline" className="w-full mb-4">
        <Camera className="h-4 w-4 mr-2" />
        Screenshot
      </Button>

      <FileUpload onFilesSelected={onFilesSelected} />
    </div>;
}