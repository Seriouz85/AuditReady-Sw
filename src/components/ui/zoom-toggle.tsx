import React, { useEffect } from "react"
import { Button } from "./button"
import { ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Define zoom levels - Fixed to use proper scaling
const ZOOM_LEVELS = {
  default: 100, // True default size (no scaling)
  medium: 110,  // +10% larger
  large: 120,   // +20% larger
};

// Create a context to store and share zoom state
export const ZoomContext = React.createContext({
  currentZoom: ZOOM_LEVELS.default,
  setZoom: (level: number) => {}
});

// Provider component to wrap the application
export function ZoomProvider({ children }: { children: React.ReactNode }) {
  const [currentZoom, setCurrentZoom] = React.useState(ZOOM_LEVELS.default);
  
  // Apply zoom level when it changes or on initial load
  useEffect(() => {
    // Base size is 80% (reasonable desktop size), zoom options scale from there
    document.documentElement.style.fontSize = `${80 * (currentZoom / 100)}%`;
    localStorage.setItem('appZoomLevel', currentZoom.toString());
  }, [currentZoom]);
  
  // Load saved zoom level from localStorage on initial render
  useEffect(() => {
    // Clear any old zoom values and reset to proper default (80% base size)
    localStorage.removeItem('appZoomLevel');
    setCurrentZoom(ZOOM_LEVELS.default);
    document.documentElement.style.fontSize = '80%';
  }, []);
  
  return (
    <ZoomContext.Provider value={{ 
      currentZoom, 
      setZoom: (level: number) => setCurrentZoom(level) 
    }}>
      {children}
    </ZoomContext.Provider>
  );
}

// Hook to use zoom context
export function useZoom() {
  const context = React.useContext(ZoomContext);
  if (context === undefined) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
}

export function ZoomToggle() {
  const { currentZoom, setZoom } = useZoom();
  
  const getZoomLabel = (zoomLevel: number) => {
    if (zoomLevel === ZOOM_LEVELS.default) return "Default";
    if (zoomLevel === ZOOM_LEVELS.medium) return "+10%";
    if (zoomLevel === ZOOM_LEVELS.large) return "+20%";
    return `${zoomLevel}%`;
  };
  
  const currentZoomLabel = getZoomLabel(currentZoom);
  
  const getNextZoomLevel = () => {
    if (currentZoom === ZOOM_LEVELS.default) return ZOOM_LEVELS.medium;
    if (currentZoom === ZOOM_LEVELS.medium) return ZOOM_LEVELS.large;
    return ZOOM_LEVELS.default; // Cycle back to default
  };
  
  const cycleZoom = () => {
    setZoom(getNextZoomLevel());
  };

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
              >
                {currentZoom === ZOOM_LEVELS.default ? 
                  <ZoomIn className="h-4 w-4" /> : 
                  <ZoomOut className="h-4 w-4" />
                }
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Adjust zoom: {currentZoomLabel}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setZoom(ZOOM_LEVELS.default)}
          className={currentZoom === ZOOM_LEVELS.default ? "bg-accent text-accent-foreground" : ""}
        >
          Default
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setZoom(ZOOM_LEVELS.medium)}
          className={currentZoom === ZOOM_LEVELS.medium ? "bg-accent text-accent-foreground" : ""}
        >
          +10%
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setZoom(ZOOM_LEVELS.large)}
          className={currentZoom === ZOOM_LEVELS.large ? "bg-accent text-accent-foreground" : ""}
        >
          +20%
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 