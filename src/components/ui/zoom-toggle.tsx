import React from "react"
import { Button } from "./button"
import { ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function ZoomToggle() {
  const [isZoomed, setIsZoomed] = React.useState(false)

  const toggleZoom = () => {
    const newZoom = !isZoomed
    setIsZoomed(newZoom)
    document.documentElement.style.fontSize = newZoom ? '100%' : '80%'
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleZoom}
      title={isZoomed ? "Zoom out to 80%" : "Zoom in to 100%"}
    >
      {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
    </Button>
  )
} 