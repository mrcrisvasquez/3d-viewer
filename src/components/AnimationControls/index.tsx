import React from 'react';
import { Play, Pause, SkipBack } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { AnimationState } from '@/types/viewer';

interface AnimationControlsProps {
  visible: boolean;
  animationState: AnimationState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  onAnimationSelect: (index: number) => void;
  onReset: () => void;
}

const speedOptions = [
  { value: 0.25, label: '0.25x' },
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
];

export function AnimationControls({
  visible,
  animationState,
  onPlayPause,
  onSeek,
  onSpeedChange,
  onAnimationSelect,
  onReset,
}: AnimationControlsProps) {
  if (animationState.animations.length === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        "glass-panel fixed bottom-20 left-1/2 -translate-x-1/2 p-4 rounded-2xl text-foreground z-10 shadow-2xl",
        "transition-panel flex items-center gap-4",
        !visible && "opacity-0 pointer-events-none translate-y-4"
      )}
    >
      {/* Animation selector (if multiple) */}
      {animationState.animations.length > 1 && (
        <Select
          value={animationState.currentIndex.toString()}
          onValueChange={(v) => onAnimationSelect(parseInt(v))}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Animation" />
          </SelectTrigger>
          <SelectContent>
            {animationState.animations.map((clip, idx) => (
              <SelectItem key={idx} value={idx.toString()}>
                {clip.name || `Animation ${idx + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Reset button */}
      <Button size="icon" variant="ghost" onClick={onReset} className="h-8 w-8">
        <SkipBack className="h-4 w-4" />
      </Button>

      {/* Play/Pause button */}
      <Button size="icon" variant="ghost" onClick={onPlayPause} className="h-8 w-8">
        {animationState.isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Timeline */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <span className="text-xs text-muted-foreground w-10">
          {formatTime(animationState.currentTime)}
        </span>
        <Slider
          value={[animationState.currentTime]}
          min={0}
          max={animationState.duration}
          step={0.01}
          onValueChange={([value]) => onSeek(value)}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-10">
          {formatTime(animationState.duration)}
        </span>
      </div>

      {/* Speed selector */}
      <Select
        value={animationState.speed.toString()}
        onValueChange={(v) => onSpeedChange(parseFloat(v))}
      >
        <SelectTrigger className="w-[70px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {speedOptions.map(({ value, label }) => (
            <SelectItem key={value} value={value.toString()}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
