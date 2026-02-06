import React from 'react';
import { DiagramNode } from './DiagramNode';
import { DiagramArrow } from './DiagramArrow';
import {
  Upload,
  FileCode,
  Cpu,
  Box,
  Sliders,
  Database,
  BarChart3,
  Play,
} from 'lucide-react';

const nodes = [
  // Row 1 - Input/Processing flow
  {
    id: 'dropzone',
    title: 'File Input',
    subtitle: 'DropZone',
    description: 'Drag-and-drop file handler supporting FBX, OBJ, and GLTF/GLB 3D model formats. Validates file types and triggers the parsing pipeline.',
    icon: Upload,
    category: 'input' as const,
    x: 40,
    y: 30,
  },
  {
    id: 'parser',
    title: 'File Parsers',
    subtitle: 'FBX/OBJ/GLTF',
    description: 'Binary and text parsers for 3D formats. fbxParser.ts extracts topology data, objParser.ts parses vertices/faces, and Three.js loaders handle geometry.',
    icon: FileCode,
    category: 'processing' as const,
    x: 240,
    y: 30,
  },
  {
    id: 'loader',
    title: 'Model Loader',
    subtitle: 'useModelLoader',
    description: 'React hook that initializes the Three.js scene, processes loaded models, applies materials, and creates visualization layers (wireframe, edges, topology).',
    icon: Cpu,
    category: 'processing' as const,
    x: 440,
    y: 30,
  },
  // Row 2 - Core rendering
  {
    id: 'scene',
    title: '3D Scene',
    subtitle: 'WebGL Canvas',
    description: 'Three.js WebGL renderer with OrbitControls for camera interaction, HDR environment mapping for realistic lighting, and real-time rendering loop.',
    icon: Box,
    category: 'output' as const,
    x: 440,
    y: 150,
  },
  {
    id: 'state',
    title: 'State Manager',
    subtitle: 'useViewerState',
    description: 'Central state management hook controlling visualization toggles, lighting settings, animation state, and model statistics. Provides reactive updates to all UI components.',
    icon: Database,
    category: 'state' as const,
    x: 240,
    y: 150,
  },
  {
    id: 'controls',
    title: 'UI Controls',
    subtitle: 'ControlPanel',
    description: 'Control panel with visualization toggles (surface, wireframe, edges, topology), lighting controls (environment rotation, exposure), and axis selector.',
    icon: Sliders,
    category: 'output' as const,
    x: 40,
    y: 150,
  },
  // Row 3 - Output panels
  {
    id: 'stats',
    title: 'Stats Panel',
    subtitle: 'Statistics',
    description: 'Real-time GPU geometry statistics including vertex count, triangle count, object count, materials, and textures. Also shows topology breakdown (quads, tris, ngons).',
    icon: BarChart3,
    category: 'output' as const,
    x: 40,
    y: 270,
  },
  {
    id: 'animation',
    title: 'Animation',
    subtitle: 'AnimationControls',
    description: 'Playback controls for animated models including play/pause, timeline scrubbing, speed control, and animation selection for models with multiple animations.',
    icon: Play,
    category: 'output' as const,
    x: 240,
    y: 270,
  },
];

const arrows = [
  // Input flow
  { from: { x: 200, y: 70 }, to: { x: 240, y: 70 } },
  { from: { x: 400, y: 70 }, to: { x: 440, y: 70 } },
  // Down to scene
  { from: { x: 520, y: 110 }, to: { x: 520, y: 150 } },
  // Scene to state
  { from: { x: 440, y: 190 }, to: { x: 400, y: 190 } },
  // State to controls
  { from: { x: 240, y: 190 }, to: { x: 200, y: 190 } },
  // State down to animation
  { from: { x: 320, y: 230 }, to: { x: 320, y: 270 } },
  // Controls down to stats
  { from: { x: 120, y: 230 }, to: { x: 120, y: 270 } },
];

export function ArchitectureDiagram() {
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 640 370"
        className="w-full min-w-[640px] h-auto"
        style={{ maxHeight: '400px' }}
      >
        {/* Background grid pattern */}
        <defs>
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="0.3"
              strokeOpacity="0.2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Arrows (rendered first so they appear behind nodes) */}
        {arrows.map((arrow, index) => (
          <DiagramArrow
            key={index}
            from={arrow.from}
            to={arrow.to}
            animated
          />
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <DiagramNode
            key={node.id}
            {...node}
          />
        ))}

        {/* Legend */}
        <g transform="translate(480, 280)">
          <text x="0" y="10" className="text-[10px] fill-muted-foreground font-medium">
            Legend
          </text>
          <rect x="0" y="20" width="12" height="12" rx="2" className="fill-stat-topology/20 stroke-stat-topology/50" strokeWidth="1" />
          <text x="18" y="30" className="text-[9px] fill-muted-foreground">Input</text>
          
          <rect x="0" y="38" width="12" height="12" rx="2" className="fill-primary/20 stroke-primary/50" strokeWidth="1" />
          <text x="18" y="48" className="text-[9px] fill-muted-foreground">Processing</text>
          
          <rect x="0" y="56" width="12" height="12" rx="2" className="fill-stat-materials/20 stroke-stat-materials/50" strokeWidth="1" />
          <text x="18" y="66" className="text-[9px] fill-muted-foreground">Output</text>
          
          <rect x="0" y="74" width="12" height="12" rx="2" className="fill-yellow-500/20 stroke-yellow-500/50" strokeWidth="1" />
          <text x="18" y="84" className="text-[9px] fill-muted-foreground">State</text>
        </g>
      </svg>
    </div>
  );
}
