/**
 * 🎯 usePresentMode Hook - Clean Present Mode Implementation
 * 
 * Extracted from EnterpriseAREditor to fix content cutoff and UI visibility issues.
 * Provides PowerPoint-style fullscreen presentation mode with complete UI hiding.
 * 
 * FIXES:
 * - Content cutoff issue resolved
 * - Project info panel properly hidden
 * - All UI elements correctly hidden in present mode
 * - Proper fullscreen handling with ESC key support
 * - Clean state restoration on exit
 */

import { useState, useCallback, useEffect } from 'react';

interface UsePresentModeOptions {
  onModeChange?: (mode: 'design' | 'present' | 'collaborate') => void;
  onStateChange?: (states: {
    activePanel: string;
    showPropertiesPanel: boolean;
    showEdgePropertiesPanel: boolean;
    showSettings: boolean;
    showColorPalette: boolean;
    showMiniMap: boolean;
    showGrid: boolean;
  }) => void;
}

interface PresentModeState {
  isPresenting: boolean;
  isFullscreen: boolean;
  previousStates: {
    activePanel: string;
    showPropertiesPanel: boolean;
    showEdgePropertiesPanel: boolean;
    showSettings: boolean;
    showColorPalette: boolean;
    showMiniMap: boolean;
    showGrid: boolean;
  } | null;
}

export const usePresentMode = (options: UsePresentModeOptions = {}) => {
  const { onModeChange, onStateChange } = options;
  
  const [presentState, setPresentState] = useState<PresentModeState>({
    isPresenting: false,
    isFullscreen: false,
    previousStates: null
  });

  // Store current UI states before entering present mode
  const storeCurrentStates = useCallback((currentStates: {
    activePanel: string;
    showPropertiesPanel: boolean;
    showEdgePropertiesPanel: boolean;
    showSettings: boolean;
    showColorPalette: boolean;
    showMiniMap: boolean;
    showGrid: boolean;
  }) => {
    setPresentState(prev => ({
      ...prev,
      previousStates: currentStates
    }));
  }, []);

  // ESC key handler for exiting present mode
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && presentState.isPresenting) {
      console.log('🎯 ESC key pressed - exiting present mode');
      exitPresentMode();
    }
  }, [presentState.isPresenting]);

  // Fullscreen change handler
  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && presentState.isPresenting) {
      console.log('🎯 Fullscreen exited externally - exiting present mode');
      exitPresentMode();
    }
  }, [presentState.isPresenting]);

  // Enter present mode with complete UI hiding
  const enterPresentMode = useCallback(async (currentStates: {
    activePanel: string;
    showPropertiesPanel: boolean;
    showEdgePropertiesPanel: boolean;
    showSettings: boolean;
    showColorPalette: boolean;
    showMiniMap: boolean;
    showGrid: boolean;
  }) => {
    console.log('🎯 Entering PowerPoint-style Present mode');
    
    // Store current states for restoration
    storeCurrentStates(currentStates);
    
    // Update present mode state
    setPresentState(prev => ({
      ...prev,
      isPresenting: true
    }));
    
    // Hide ALL UI elements for clean presentation
    const hiddenStates = {
      activePanel: '',
      showPropertiesPanel: false,
      showEdgePropertiesPanel: false,
      showSettings: false,
      showColorPalette: false,
      showMiniMap: false,
      showGrid: false
    };
    
    // Notify parent component to update UI states
    onStateChange?.(hiddenStates);
    onModeChange?.('present');
    
    // Request true fullscreen like PowerPoint
    try {
      // Try body element for full page fullscreen
      if (document.fullscreenEnabled) {
        await document.body.requestFullscreen();
        setPresentState(prev => ({
          ...prev,
          isFullscreen: true
        }));
        
        console.log('🎯 Entered true fullscreen Present mode (PowerPoint style)');
      } else {
        // Fallback for browsers that don't support fullscreen
        setPresentState(prev => ({
          ...prev,
          isFullscreen: true
        }));
        console.log('🎯 Entered Present mode (fullscreen API not supported)');
      }
    } catch (error) {
      console.warn('Could not enter fullscreen:', error);
      setPresentState(prev => ({
        ...prev,
        isFullscreen: true
      }));
    }
  }, [storeCurrentStates, onStateChange, onModeChange]);

  // Exit present mode and restore previous states
  const exitPresentMode = useCallback(async () => {
    console.log('🎯 Exiting Present mode');
    
    // Exit fullscreen if active
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.warn('Could not exit fullscreen:', error);
      }
    }
    
    // Restore previous UI states
    if (presentState.previousStates) {
      onStateChange?.(presentState.previousStates);
    }
    
    // Update present mode state
    setPresentState({
      isPresenting: false,
      isFullscreen: false,
      previousStates: null
    });
    
    // Notify parent component
    onModeChange?.('design');
    
    console.log('🎯 Exited Present mode - UI states restored');
  }, [presentState.previousStates, onStateChange, onModeChange]);

  // Toggle present mode
  const togglePresentMode = useCallback((currentStates?: {
    activePanel: string;
    showPropertiesPanel: boolean;
    showEdgePropertiesPanel: boolean;
    showSettings: boolean;
    showColorPalette: boolean;
    showMiniMap: boolean;
    showGrid: boolean;
  }) => {
    if (presentState.isPresenting) {
      exitPresentMode();
    } else if (currentStates) {
      enterPresentMode(currentStates);
    }
  }, [presentState.isPresenting, enterPresentMode, exitPresentMode]);

  // Set up event listeners for ESC key and fullscreen changes
  useEffect(() => {
    if (presentState.isPresenting) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
      };
    }
  }, [presentState.isPresenting, handleEscapeKey, handleFullscreenChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (presentState.isPresenting) {
        exitPresentMode();
      }
    };
  }, []);

  return {
    // State
    isPresenting: presentState.isPresenting,
    isFullscreen: presentState.isFullscreen,
    
    // Actions
    enterPresentMode,
    exitPresentMode,
    togglePresentMode,
    
    // Utility
    hasPreviousStates: presentState.previousStates !== null
  };
};

export default usePresentMode;