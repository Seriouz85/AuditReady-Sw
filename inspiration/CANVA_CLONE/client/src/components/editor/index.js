"use client";

import { useParams, useRouter } from "next/navigation";
import Canvas from "./canvas";
import Header from "./header";
import Sidebar from "./sidebar";
import { useCallback, useEffect, useState } from "react";
import { useEditorStore } from "@/store";
import { getUserDesignByID } from "@/services/design-service";
import Properties from "./properties";
import SubscriptionModal from "../subscription/premium-modal";

function MainEditor() {
  const params = useParams();
  const router = useRouter();
  const designId = params?.slug;

  const [isLoading, setIsLoading] = useState(!!designId);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const [error, setError] = useState(null);

  const {
    canvas,
    setDesignId,
    resetStore,
    setName,
    setShowProperties,
    showProperties,
    isEditing,
    setShowPremiumModal,
    showPremiumModal,
  } = useEditorStore();

  useEffect(() => {
    //reset the store
    resetStore();

    //set the design id

    if (designId) setDesignId(designId);

    return () => {
      resetStore();
    };
  }, []);

  useEffect(() => {
    setLoadAttempted(false);
    setError(null);
  }, [designId]);

  useEffect(() => {
    if (isLoading && !canvas && designId) {
      const timer = setTimeout(() => {
        if (isLoading) {
          console.log("Canvas init timeout");
          setIsLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, canvas, designId]);

  useEffect(() => {
    if (canvas) {
      console.log("Canvas is now available in editor");
    }
  }, [canvas]);

  //load the design ->
  const loadDesign = useCallback(async () => {
    if (!canvas || !designId || loadAttempted) return;
    try {
      setIsLoading(true);
      setLoadAttempted(true);

      const response = await getUserDesignByID(designId);
      const design = response.data;

      if (design) {
        //update name
        setName(design.name);

        //set the design ID just incase after getting the data
        setDesignId(designId);

        try {
          if (design.canvasData) {
            canvas.clear();
            if (design.width && design.height) {
              canvas.setDimensions({
                width: design.width,
                height: design.height,
              });
            }

            const canvasData =
              typeof design.canvasData === "string"
                ? JSON.parse(design.canvasData)
                : design.canvasData;

            const hasObjects =
              canvasData.objects && canvasData.objects.length > 0;

            if (canvasData.background) {
              canvas.backgroundColor = canvasData.background;
            } else {
              canvas.backgroundColor = "#ffffff";
            }

            if (!hasObjects) {
              canvas.renderAll();
              return true;
            }

            canvas
              .loadFromJSON(design.canvasData)
              .then((canvas) => canvas.requestRenderAll());
          } else {
            console.log("no canvas data");
            canvas.clear();
            canvas.setWidth(design.width);
            canvas.setHeight(design.height);
            canvas.backgroundColor = "#ffffff";
            canvas.renderAll();
          }
        } catch (e) {
          console.error(("Error loading canvas", e));
          setError("Error loading canvas");
        } finally {
          setIsLoading(false);
        }
      }

      console.log(response);
    } catch (e) {
      console.error("Failed to load design", e);
      setError("failed to load design");
      setIsLoading(false);
    }
  }, [canvas, designId, loadAttempted, setDesignId]);

  useEffect(() => {
    if (designId && canvas && !loadAttempted) {
      loadDesign();
    } else if (!designId) {
      router.replace("/");
    }
  }, [canvas, designId, loadDesign, loadAttempted, router]);

  useEffect(() => {
    if (!canvas) return;

    const handleSelectionCreated = () => {
      const activeObject = canvas.getActiveObject();

      console.log(activeObject, "activeObject");

      if (activeObject) {
        setShowProperties(true);
      }
    };

    const handleSelectionCleared = () => {
      setShowProperties(false);
    };

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionCreated);
    canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionCreated);
      canvas.off("selection:cleared", handleSelectionCleared);
    };
  }, [canvas]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {isEditing && <Sidebar />}

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <main className="flex-1 overflow-hidden bg-[#f0f0f0] flex items-center justify-center">
            <Canvas />
          </main>
        </div>
      </div>
      {showProperties && isEditing && <Properties />}
      <SubscriptionModal
        isOpen={showPremiumModal}
        onClose={setShowPremiumModal}
      />
    </div>
  );
}

export default MainEditor;
