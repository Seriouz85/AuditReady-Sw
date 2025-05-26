"use client";

import { designTypes } from "@/config";
import { saveDesign } from "@/services/design-service";
import { useEditorStore } from "@/store";
import { Loader, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function DesignTypes() {
  const { userDesigns, userSubscription } = useEditorStore();
  const [currentSelectedType, setCurrentSelectedType] = useState(-1);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateNewDesign = async (getCurrentType, index) => {
    setCurrentSelectedType(index);
    if (userDesigns?.length >= 5 && !userSubscription.isPremium) {
      toast.error("Please upgrade to premium!", {
        description: "You need to upgrade to premium to create more designs",
      });

      return;
    }
    if (loading) return;
    try {
      setLoading(true);

      const initialDesignData = {
        name: getCurrentType.label,
        canvasData: null,
        width: getCurrentType.width,
        height: getCurrentType.height,
        category: getCurrentType.label,
      };

      const newDesign = await saveDesign(initialDesignData);

      if (newDesign?.success) {
        router.push(`/editor/${newDesign?.data?._id}`);
        setLoading(false);
      } else {
        throw new Error("Failed to create new design");
      }
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 mt-12 justify-center">
      {designTypes.map((type, index) => (
        <div
          onClick={() => handleCreateNewDesign(type, index)}
          key={index}
          className="flex cursor-pointer flex-col items-center"
        >
          <div
            className={`${type.bgColor} w-14 h-14 rounded-full flex items-center justify-center mb-2`}
          >
            {type.icon}
          </div>
          <span className="text-xs items-center flex gap-2 text-center">
            {loading && currentSelectedType === index && (
              <Loader className="w-3 h-3" />
            )}
            {type.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default DesignTypes;
