import React from 'react';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
}

interface DiagramArrowProps {
  from: Point;
  to: Point;
  animated?: boolean;
  className?: string;
}

export function DiagramArrow({ from, to, animated = true, className }: DiagramArrowProps) {
  // Calculate control points for a smooth curve
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Determine if it's more horizontal or vertical
  const isHorizontal = Math.abs(dx) > Math.abs(dy);
  
  let path: string;
  if (isHorizontal) {
    // Horizontal curve with midpoint bend
    const midX = from.x + dx / 2;
    path = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  } else {
    // Vertical curve with midpoint bend
    const midY = from.y + dy / 2;
    path = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
  }

  const arrowId = `arrow-${from.x}-${from.y}-${to.x}-${to.y}`;

  return (
    <g className={cn('arrow-group', className)}>
      <defs>
        <marker
          id={arrowId}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L8,3 z"
            className="fill-muted-foreground/60"
          />
        </marker>
        {animated && (
          <linearGradient id={`gradient-${arrowId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.2">
              <animate
                attributeName="offset"
                values="-1;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.8">
              <animate
                attributeName="offset"
                values="0;2"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.2">
              <animate
                attributeName="offset"
                values="1;3"
                dur="2s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        )}
      </defs>
      <path
        d={path}
        fill="none"
        stroke={animated ? `url(#gradient-${arrowId})` : 'hsl(var(--muted-foreground))'}
        strokeWidth="2"
        strokeOpacity={animated ? 1 : 0.4}
        markerEnd={`url(#${arrowId})`}
        className="transition-all duration-300"
      />
    </g>
  );
}
