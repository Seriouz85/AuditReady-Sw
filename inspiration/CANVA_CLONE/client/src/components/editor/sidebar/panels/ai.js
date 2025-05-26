"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addImageToCanvas } from "@/fabric/fabric-utils";
import { generateImageFromAI } from "@/services/upload-service";
import { useEditorStore } from "@/store";
import { Loader, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

function AiPanel() {
  const { canvas } = useEditorStore();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedContent(null);
    setUploadSuccess(false);

    try {
      await generateImage(prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async (prompt) => {
    try {
      const response = await generateImageFromAI(prompt);
      if (response && response?.data?.url) {
        setGeneratedContent(response?.data?.url);
      }
      console.log(response);
    } catch (e) {
      console.error("Error generating image from AI");
      throw e;
    }
  };

  const handleAiImageToCanvas = async () => {
    if (!canvas && !generatedContent) return;

    addImageToCanvas(canvas, generatedContent);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2 mb-2">
          <Wand2 className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI Image Generator</h3>
        </div>
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={handlePromptChange}
            placeholder="e.g., A cute dog image..."
            className={"resize-none min-h-[200px]"}
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isLoading}
          className={"w-full"}
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="border rounded-md bg-gray-50 p-6 flex-col items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-purple-500 mb-3" />
          <p className="text-sm text-center text-gray-600">
            Creating your image ...
          </p>
        </div>
      )}

      {generatedContent && !isLoading && (
        <div className="space-y-2">
          <div className="border rounded-md overflow-hidden">
            <img src={generatedContent} className="w-full h-auto" />
          </div>
          <div>
            <Button
              onClick={handleAiImageToCanvas}
              className={"flex-1"}
              variant={uploadSuccess ? "outline" : "default"}
              disabled={isUploading}
            >
              Add To Canvas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiPanel;
