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

// Define zoom levels
const ZOOM_LEVELS = {
  default: 80, // -20% from normal (our standard default)
  medium: 90,  // -10% from normal
  large: 100,  // normal size
  larger: 110  // +10% from normal
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
    document.documentElement.style.fontSize = `${currentZoom}%`;
    localStorage.setItem('appZoomLevel', currentZoom.toString());
  }, [currentZoom]);
  
  // Load saved zoom level from localStorage on initial render
  useEffect(() => {
    const savedZoom = localStorage.getItem('appZoomLevel');
    if (savedZoom) {
      setCurrentZoom(parseInt(savedZoom, 10));
    }
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
    if (zoomLevel === ZOOM_LEVELS.default) return "Default (-20%)";
    if (zoomLevel === ZOOM_LEVELS.medium) return "Medium (-10%)";
    if (zoomLevel === ZOOM_LEVELS.large) return "Large (Normal)";
    if (zoomLevel === ZOOM_LEVELS.larger) return "Larger (+10%)";
    return `${zoomLevel}%`;
  };
  
  const currentZoomLabel = getZoomLabel(currentZoom);
  
  const getNextZoomLevel = () => {
    if (currentZoom === ZOOM_LEVELS.default) return ZOOM_LEVELS.medium;
    if (currentZoom === ZOOM_LEVELS.medium) return ZOOM_LEVELS.large;
    if (currentZoom === ZOOM_LEVELS.large) return ZOOM_LEVELS.larger;
    return ZOOM_LEVELS.default; // Cycle back to default
  };
  
  const cycleZoom = () => {
    setZoom(getNextZoomLevel());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title={`Current zoom: ${currentZoomLabel}. Click to change.`}
        >
          {currentZoom < ZOOM_LEVELS.large ? 
            <ZoomIn className="h-4 w-4" /> : 
            <ZoomOut className="h-4 w-4" />
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setZoom(ZOOM_LEVELS.default)}
          className={currentZoom === ZOOM_LEVELS.default ? "bg-accent text-accent-foreground" : ""}
        >
          Default (-20%)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setZoom(ZOOM_LEVELS.medium)}
          className={currentZoom === ZOOM_LEVELS.medium ? "bg-accent text-accent-foreground" : ""}
        >
          Medium (-10%)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setZoom(ZOOM_LEVELS.large)}
          className={currentZoom === ZOOM_LEVELS.large ? "bg-accent text-accent-foreground" : ""}
        >
          Large (Normal)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setZoom(ZOOM_LEVELS.larger)}
          className={currentZoom === ZOOM_LEVELS.larger ? "bg-accent text-accent-foreground" : ""}
        >
          Larger (+10%)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 