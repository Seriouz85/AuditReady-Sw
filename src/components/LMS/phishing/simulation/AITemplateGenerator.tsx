import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bot, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { AIConfig } from '../types';

interface AITemplateGeneratorProps {
  aiConfig: AIConfig;
  onAIConfigChange: (config: AIConfig) => void;
  onGenerateTemplate: () => void;
}

export const AITemplateGenerator: React.FC<AITemplateGeneratorProps> = ({
  aiConfig,
  onAIConfigChange,
  onGenerateTemplate
}) => {
  return (
    <div className="mt-8 border-t pt-6 mb-6">
      <div>
        <div className="flex items-center mb-4">
          <Bot className="h-5 w-5 text-purple-500 mr-2" />
          <h3 className="font-medium">AI Phishing Template Generator</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="aiPrompt">What kind of phishing email do you need?</Label>
            <Textarea 
              id="aiPrompt" 
              placeholder="Describe the scenario (e.g., 'Password reset email targeting finance department' or 'IT security update with urgent action required')" 
              className="mt-1 min-h-[80px] rounded-xl"
              value={aiConfig.prompt}
              onChange={(e) => onAIConfigChange({...aiConfig, prompt: e.target.value})}
            />
          </div>
          
          {aiConfig.error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                <p>{aiConfig.error}</p>
              </div>
            </div>
          )}
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
            onClick={onGenerateTemplate}
            disabled={aiConfig.generating || !aiConfig.prompt}
          >
            {aiConfig.generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Your Phishing Template...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Phishing Template
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};