"use client";

import { addShapeToCanvas } from "@/fabric/fabric-utils";
import {
  shapeDefinitions,
  shapeTypes,
} from "@/fabric/shapes/shape-definitions";
import { useEditorStore } from "@/store";
import { useEffect, useRef, useState } from "react";

function ElementsPanel() {
  const { canvas } = useEditorStore();
  const miniCanvasRef = useRef({});
  const canvasElementRef = useRef({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) return;

    const timer = setTimeout(async () => {
      try {
        const fabric = await import("fabric");

        for (const shapeType of shapeTypes) {
          const canvasElement = canvasElementRef.current[shapeType];
          if (!canvasElement) continue;
          const canvasId = `mini-canvas-${shapeType}-${Date.now()}`;
          canvasElement.id = canvasId;

          try {
            const definition = shapeDefinitions[shapeType];

            const miniCanvas = new fabric.StaticCanvas(canvasId, {
              width: 100,
              height: 100,
              backgroundColor: "transparent",
              renderOnAddRemove: true,
            });

            miniCanvasRef.current[shapeType] = miniCanvas;
            definition.thumbnail(fabric, miniCanvas);
            miniCanvas.renderAll();
          } catch (definitionErr) {
            console.error("Error while creating definition", definitionErr);
          }
        }
        setIsInitialized(true);
      } catch (e) {
        console.error("failed to init", e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isInitialized]);

  useEffect(() => {
    return () => {
      Object.values(miniCanvasRef.current).forEach((miniCanvas) => {
        if (miniCanvas && typeof miniCanvas.dispose === "function") {
          try {
            miniCanvas.dispose();
          } catch (e) {
            console.error("Error disposing canvas", e);
          }
        }
      });

      miniCanvasRef.current = {};
      setIsInitialized(false);
    };
  }, []);

  const setCanvasRef = (getCurrentElement, shapeType) => {
    if (getCurrentElement) {
      canvasElementRef.current[shapeType] = getCurrentElement;
    }
  };

  const handleShapeClick = (type) => {
    addShapeToCanvas(canvas, type);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="grid grid-cols-3 gap-1">
          {shapeTypes.map((shapeType) => (
            <div
              style={{ height: "90px" }}
              className="cursor-pointer flex flex-col items-center justify-center"
              key={shapeType}
              onClick={() => handleShapeClick(shapeType)}
            >
              <canvas
                width="100"
                height="100"
                ref={(el) => setCanvasRef(el, shapeType)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ElementsPanel;
