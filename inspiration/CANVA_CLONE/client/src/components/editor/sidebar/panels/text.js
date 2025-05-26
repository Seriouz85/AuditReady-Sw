"use client";

import { Button } from "@/components/ui/button";
import { textPresets } from "@/config";
import { addTextToCanvas } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import { Type } from "lucide-react";

function TextPanel() {
  const { canvas } = useEditorStore();

  const handleAddCustomTextBox = () => {
    if (!canvas) return;

    addTextToCanvas(canvas, "Enter text here", { fontSize: 24 });
  };

  const handleAddPresetText = (currentPreset) => {
    if (!canvas) return;
    addTextToCanvas(canvas, currentPreset.text, currentPreset);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <Button
          onClick={handleAddCustomTextBox}
          className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center justify-center transition-colors"
        >
          <Type className="mr-2 h-5 w-5" />
          <span className="font-medium">Add a text box</span>
        </Button>
        <div className="pt-2">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            Default Text Styles
          </h4>
          <div className="space-y-4">
            {textPresets.map((preset, index) => (
              <button
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                key={index}
                onClick={() => handleAddPresetText(preset)}
                style={{
                  fontSize: `${Math.min(preset.fontSize / 1.8, 24)}px`,
                  fontWeight: preset.fontWeight,
                  fontStyle: preset.fontStyle || "normal",
                  fontFamily: preset.fontFamily,
                }}
              >
                {preset.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextPanel;
