import React from 'react';
import { cn } from '@/lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { LucideIcon } from 'lucide-react';

export type NodeCategory = 'input' | 'processing' | 'output' | 'state';

interface DiagramNodeProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  category: NodeCategory;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

const categoryStyles: Record<NodeCategory, string> = {
  input: 'border-stat-topology/50 bg-stat-topology/10',
  processing: 'border-primary/50 bg-primary/10',
  output: 'border-stat-materials/50 bg-stat-materials/10',
  state: 'border-yellow-500/50 bg-yellow-500/10',
};

const categoryGlow: Record<NodeCategory, string> = {
  input: 'hover:shadow-[0_0_20px_rgba(0,200,200,0.3)]',
  processing: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  output: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
  state: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]',
};

export function DiagramNode({
  id,
  title,
  subtitle,
  description,
  icon: Icon,
  category,
  x,
  y,
  width = 160,
  height = 80,
}: DiagramNodeProps) {
  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <HoverCard openDelay={100} closeDelay={100}>
        <HoverCardTrigger asChild>
          <div
            data-node-id={id}
            className={cn(
              'w-full h-full rounded-xl border backdrop-blur-sm cursor-pointer',
              'transition-all duration-300 ease-out',
              'flex flex-col items-center justify-center gap-1 p-3',
              categoryStyles[category],
              categoryGlow[category]
            )}
          >
            <Icon className="w-5 h-5 text-foreground/80" />
            <span className="text-xs font-semibold text-foreground text-center leading-tight">
              {title}
            </span>
            <span className="text-[10px] text-muted-foreground text-center">
              {subtitle}
            </span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent 
          className="w-64 glass-panel"
          side="top"
          sideOffset={8}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold">{title}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </foreignObject>
  );
}
