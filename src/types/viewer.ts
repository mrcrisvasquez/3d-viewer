import * as THREE from 'three';

export type UpAxis = 'X' | 'Y' | 'Z';
export type UpAxisIndex = 0 | 1 | 2;

export interface ModelStats {
  vertices: number;
  triangles: number;
  objects: number;
  materials: number;
  textures: number;
}

export interface TopologyStats {
  quads: number;
  tris: number;
  ngons: number;
  edges: number;
}

export interface TopologyData {
  vertices: THREE.Vector3[];
  faces: number[][];
  stats: TopologyStats;
  needsNormalization?: boolean;
}

export interface ToggleStates {
  surface: boolean;
  materials: boolean;
  wireframe: boolean;
  topology: boolean;
  edges: boolean;
  bbox: boolean;
}

export interface LightingSettings {
  envRotation: number;
  exposure: number;
}

export interface AnimationState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  currentIndex: number;
  animations: THREE.AnimationClip[];
}

export interface ViewerState {
  isLoading: boolean;
  loadingProgress: number;
  statusMessage: string;
  statusType: 'info' | 'loading' | 'error' | 'success';
  hasModel: boolean;
  detectedAxis: UpAxis | null;
  selectedAxis: UpAxis;
}
