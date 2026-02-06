import * as THREE from 'three';
import type { TopologyData } from '@/types/viewer';

// Extract topology from OBJ text (preserves quads/ngons)
export function extractTopologyFromOBJ(text: string): TopologyData {
  const vertices: THREE.Vector3[] = [];
  const faces: number[][] = [];
  const stats = { quads: 0, tris: 0, ngons: 0, edges: 0 };

  const lines = text.split('\n');

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const type = parts[0];

    if (type === 'v') {
      vertices.push(new THREE.Vector3(
        parseFloat(parts[1]),
        parseFloat(parts[2]),
        parseFloat(parts[3])
      ));
    } else if (type === 'f') {
      const faceIndices: number[] = [];
      for (let i = 1; i < parts.length; i++) {
        const idx = parseInt(parts[i].split('/')[0]) - 1;
        faceIndices.push(idx);
      }

      if (faceIndices.length === 3) stats.tris++;
      else if (faceIndices.length === 4) stats.quads++;
      else if (faceIndices.length >= 5) stats.ngons++;

      faces.push(faceIndices);
    }
  }

  // Count edges
  stats.edges = countEdges(faces);

  return { vertices, faces, stats };
}

// Count unique edges from faces
function countEdges(faces: number[][]): number {
  const edgeSet = new Set<string>();
  
  for (const face of faces) {
    for (let i = 0; i < face.length; i++) {
      const a = face[i];
      const b = face[(i + 1) % face.length];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      edgeSet.add(key);
    }
  }
  
  return edgeSet.size;
}
