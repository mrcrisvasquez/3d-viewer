import { useState, useCallback } from 'react';
import type { 
  ToggleStates, 
  LightingSettings, 
  ModelStats, 
  TopologyStats, 
  ViewerState, 
  UpAxis,
  AnimationState 
} from '@/types/viewer';

const initialToggleStates: ToggleStates = {
  surface: true,
  materials: false,
  wireframe: false,
  topology: false,
  edges: false,
  bbox: false,
};

const initialLightingSettings: LightingSettings = {
  envRotation: 0,
  exposure: 1.0,
};

const initialModelStats: ModelStats = {
  vertices: 0,
  triangles: 0,
  objects: 0,
  materials: 0,
  textures: 0,
};

const initialTopologyStats: TopologyStats = {
  quads: 0,
  tris: 0,
  ngons: 0,
  edges: 0,
};

const initialViewerState: ViewerState = {
  isLoading: false,
  loadingProgress: 0,
  statusMessage: '📂 Drop a 3D model or use the Browse button',
  statusType: 'info',
  hasModel: false,
  detectedAxis: null,
  selectedAxis: 'Y',
};

const initialAnimationState: AnimationState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  speed: 1,
  currentIndex: 0,
  animations: [],
};

export function useViewerState() {
  const [toggleStates, setToggleStates] = useState<ToggleStates>(initialToggleStates);
  const [lightingSettings, setLightingSettings] = useState<LightingSettings>(initialLightingSettings);
  const [modelStats, setModelStats] = useState<ModelStats>(initialModelStats);
  const [topologyStats, setTopologyStats] = useState<TopologyStats>(initialTopologyStats);
  const [viewerState, setViewerState] = useState<ViewerState>(initialViewerState);
  const [animationState, setAnimationState] = useState<AnimationState>(initialAnimationState);
  const [panelsVisible, setPanelsVisible] = useState(true);

  const toggleLayer = useCallback((layer: keyof ToggleStates) => {
    setToggleStates((prev) => {
      const newState = { ...prev, [layer]: !prev[layer] };
      
      // If surface is turned on, turn off materials and vice versa
      if (layer === 'surface' && newState.surface && prev.materials) {
        newState.materials = false;
      } else if (layer === 'materials' && newState.materials && prev.surface) {
        newState.surface = false;
      }
      
      return newState;
    });
  }, []);

  const updateLighting = useCallback((settings: Partial<LightingSettings>) => {
    setLightingSettings((prev) => ({ ...prev, ...settings }));
  }, []);

  const updateModelStats = useCallback((stats: ModelStats) => {
    setModelStats(stats);
  }, []);

  const updateTopologyStats = useCallback((stats: TopologyStats) => {
    setTopologyStats(stats);
  }, []);

  const updateViewerState = useCallback((state: Partial<ViewerState>) => {
    setViewerState((prev) => ({ ...prev, ...state }));
  }, []);

  const setSelectedAxis = useCallback((axis: UpAxis) => {
    setViewerState((prev) => ({ ...prev, selectedAxis: axis }));
  }, []);

  const updateAnimationState = useCallback((state: Partial<AnimationState>) => {
    setAnimationState((prev) => ({ ...prev, ...state }));
  }, []);

  const togglePanels = useCallback(() => {
    setPanelsVisible((prev) => !prev);
  }, []);

  const showStatus = useCallback((message: string, type: ViewerState['statusType'] = 'info') => {
    setViewerState((prev) => ({
      ...prev,
      statusMessage: message,
      statusType: type,
      isLoading: type === 'loading',
    }));
  }, []);

  return {
    // States
    toggleStates,
    lightingSettings,
    modelStats,
    topologyStats,
    viewerState,
    animationState,
    panelsVisible,
    
    // Actions
    toggleLayer,
    updateLighting,
    updateModelStats,
    updateTopologyStats,
    updateViewerState,
    setSelectedAxis,
    updateAnimationState,
    togglePanels,
    showStatus,
  };
}
