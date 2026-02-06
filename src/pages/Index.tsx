import React, { useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import { DropZone } from '@/components/DropZone';
import { ControlPanel } from '@/components/ControlPanel';
import { StatsPanel } from '@/components/StatsPanel';
import { AnimationControls } from '@/components/AnimationControls';
import { StatusBar } from '@/components/StatusBar';
import { TogglePanelsButton } from '@/components/TogglePanelsButton';
import { FeedbackButton } from '@/components/FeedbackButton';
import { Button } from '@/components/ui/button';
import { useViewerState } from '@/hooks/useViewerState';
import { useModelLoader } from '@/hooks/useModelLoader';
import type { UpAxis } from '@/types/viewer';

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    toggleStates,
    lightingSettings,
    modelStats,
    topologyStats,
    viewerState,
    animationState,
    panelsVisible,
    toggleLayer,
    updateLighting,
    updateModelStats,
    updateTopologyStats,
    updateViewerState,
    setSelectedAxis,
    updateAnimationState,
    togglePanels,
    showStatus,
  } = useViewerState();

  const {
    initScene,
    handleFiles,
    reloadWithAxis,
    updateToggleVisibility,
    updateLighting: updateSceneLighting,
    takeScreenshot,
    playAnimation,
    pauseAnimation,
    seekAnimation,
    setAnimationSpeed,
    playAnimationClip,
  } = useModelLoader({
    onModelStatsUpdate: updateModelStats,
    onTopologyStatsUpdate: updateTopologyStats,
    onStatusChange: showStatus,
    onDetectedAxisChange: (axis) => updateViewerState({ detectedAxis: axis }),
    onAnimationsLoaded: updateAnimationState,
  });

  // Initialize scene
  useEffect(() => {
    if (containerRef.current) {
      const cleanup = initScene(containerRef.current);
      return cleanup;
    }
  }, [initScene]);

  // Update scene when toggle states change
  useEffect(() => {
    updateToggleVisibility(toggleStates);
  }, [toggleStates, updateToggleVisibility]);

  // Update scene when lighting changes
  useEffect(() => {
    updateSceneLighting(lightingSettings);
  }, [lightingSettings, updateSceneLighting]);

  // Handle file drop
  const handleFilesDropped = useCallback((files: FileList) => {
    handleFiles(files, viewerState.selectedAxis);
    updateViewerState({ hasModel: true });
  }, [handleFiles, viewerState.selectedAxis, updateViewerState]);

  // Handle axis change
  const handleAxisChange = useCallback((axis: UpAxis) => {
    setSelectedAxis(axis);
    if (viewerState.hasModel) {
      reloadWithAxis(axis);
    }
  }, [setSelectedAxis, viewerState.hasModel, reloadWithAxis]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (animationState.isPlaying) {
      pauseAnimation();
      updateAnimationState({ isPlaying: false });
    } else {
      if (animationState.animations.length > 0) {
        playAnimationClip(animationState.currentIndex, animationState.animations);
      }
      playAnimation();
      updateAnimationState({ isPlaying: true });
    }
  }, [animationState, pauseAnimation, playAnimation, playAnimationClip, updateAnimationState]);

  // Handle seek
  const handleSeek = useCallback((time: number) => {
    seekAnimation(time);
    updateAnimationState({ currentTime: time });
  }, [seekAnimation, updateAnimationState]);

  // Handle speed change
  const handleSpeedChange = useCallback((speed: number) => {
    setAnimationSpeed(speed);
    updateAnimationState({ speed });
  }, [setAnimationSpeed, updateAnimationState]);

  // Handle animation selection
  const handleAnimationSelect = useCallback((index: number) => {
    updateAnimationState({
      currentIndex: index,
      duration: animationState.animations[index]?.duration || 0
    });
    if (animationState.isPlaying) {
      playAnimationClip(index, animationState.animations);
    }
  }, [animationState, playAnimationClip, updateAnimationState]);

  // Handle reset
  const handleReset = useCallback(() => {
    seekAnimation(0);
    updateAnimationState({ currentTime: 0 });
  }, [seekAnimation, updateAnimationState]);

  return (
    <DropZone onFilesDropped={handleFilesDropped}>
      <div id="canvas-container" ref={containerRef} className="w-screen h-screen" />

      <ControlPanel
        visible={panelsVisible}
        toggleStates={toggleStates}
        lightingSettings={lightingSettings}
        selectedAxis={viewerState.selectedAxis}
        detectedAxis={viewerState.detectedAxis}
        onToggle={toggleLayer}
        onLightingUpdate={updateLighting}
        onAxisSelect={handleAxisChange}
        onFilesSelected={handleFilesDropped}
        onScreenshot={takeScreenshot}
      />

      <StatsPanel
        visible={panelsVisible}
        modelStats={modelStats}
        topologyStats={topologyStats}
      />

      <AnimationControls
        visible={panelsVisible && animationState.animations.length > 0}
        animationState={animationState}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onSpeedChange={handleSpeedChange}
        onAnimationSelect={handleAnimationSelect}
        onReset={handleReset}
      />

      <StatusBar
        visible={panelsVisible}
        viewerState={viewerState}
      />

      <TogglePanelsButton
        panelsVisible={panelsVisible}
        onToggle={togglePanels}
      />

      <Link to="/about">
        <Button
          size="icon"
          variant="ghost"
          className="fixed bottom-20 right-4 z-30 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg hover:bg-accent/80 transition-all"
          title="About"
        >
          <Info className="h-5 w-5" />
        </Button>
      </Link>

      <FeedbackButton />
    </DropZone>
  );
};

export default Index;
