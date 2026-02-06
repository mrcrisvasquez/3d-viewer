import React from 'react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/utils/formatNumber';
import type { ModelStats, TopologyStats } from '@/types/viewer';

interface StatsPanelProps {
  visible: boolean;
  modelStats: ModelStats;
  topologyStats: TopologyStats;
}

export function StatsPanel({ visible, modelStats, topologyStats }: StatsPanelProps) {
  return (
    <div
      className={cn(
        "glass-panel fixed top-4 right-4 p-5 rounded-2xl text-foreground min-w-[260px] z-10 shadow-2xl",
        "transition-panel",
        !visible && "opacity-0 pointer-events-none translate-x-4"
      )}
    >
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="text-2xl">📊</span> Statistics
      </h2>

      <div className="space-y-4">
        {/* GPU Geometry */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            GPU Geometry
          </h3>
          <div className="space-y-1.5 text-sm">
            <StatRow label="Vertices" value={formatNumber(modelStats.vertices)} colorClass="text-stat-gpu" />
            <StatRow label="Triangles" value={formatNumber(modelStats.triangles)} colorClass="text-stat-gpu" />
            <StatRow label="Objects" value={formatNumber(modelStats.objects)} colorClass="text-stat-gpu" />
          </div>
        </div>

        {/* Original Topology */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Original Topology
          </h3>
          <div className="space-y-1.5 text-sm">
            <StatRow label="Quads" value={formatNumber(topologyStats.quads)} colorClass="text-stat-topology" />
            <StatRow label="Triangles" value={formatNumber(topologyStats.tris)} colorClass="text-stat-topology" />
            <StatRow label="N-gons (5+)" value={formatNumber(topologyStats.ngons)} colorClass="text-stat-topology" />
            <StatRow label="Edges" value={formatNumber(topologyStats.edges)} colorClass="text-stat-topology" />
          </div>
        </div>

        {/* Materials */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Materials
          </h3>
          <div className="space-y-1.5 text-sm">
            <StatRow label="Materials" value={formatNumber(modelStats.materials)} colorClass="text-stat-materials" />
            <StatRow label="Textures" value={formatNumber(modelStats.textures)} colorClass="text-stat-materials" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  colorClass: string;
}

function StatRow({ label, value, colorClass }: StatRowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className={cn("stat-value font-mono", colorClass)}>{value}</span>
    </div>
  );
}
