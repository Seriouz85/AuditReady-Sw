import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AIConfig } from '../types';

interface AISettingsProps {
  aiConfig: AIConfig;
  showApiKey: boolean;
  onConfigChange: (config: AIConfig) => void;
  onToggleApiKey: () => void;
}

export const AISettings: React.FC<AISettingsProps> = ({
  aiConfig,
  showApiKey,
  onConfigChange,
  onToggleApiKey
}) => {
  const updateConfig = (updates: Partial<AIConfig>) => {
    onConfigChange({ ...aiConfig, ...updates });
  };

  return (
    <div className="border-t pt-6 mt-6">
      <h3 className="text-lg font-medium mb-4">AI Template Generator Settings</h3>
      
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Configure your Gemini API key to enable AI-powered phishing template generation
        </p>

        <div>
          <Label htmlFor="geminiApiKey">Gemini API Key</Label>
          <div className="mt-1 relative">
            <Input 
              id="geminiApiKey" 
              type={showApiKey ? "text" : "password"}
              className="rounded-xl font-mono text-sm pr-16"
              value={aiConfig.apiKey}
              onChange={(e) => updateConfig({ apiKey: e.target.value })}
              placeholder="Enter your Gemini API key"
            />
            <Button 
              size="sm" 
              variant="ghost" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 text-xs"
              onClick={onToggleApiKey}
            >
              {showApiKey ? 'Hide' : 'Show'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Get a Gemini API key from <a href="https://makersuite.google.com/app/apikey" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Google AI Studio</a>
          </p>
        </div>
      </div>
    </div>
  );
};