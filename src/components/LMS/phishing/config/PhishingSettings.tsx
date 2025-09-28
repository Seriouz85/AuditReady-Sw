import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { ScheduleSettings as ScheduleSettingsType, AIConfig } from '../types';
import { ScheduleSettings } from './ScheduleSettings';
import { EmailAPISettings } from './EmailAPISettings';
import { AISettings } from './AISettings';
import { NotificationSettings } from './NotificationSettings';

interface EmailAPIConfig {
  apiKey: string;
  smtpHost?: string;
  smtpPort?: number;
  useTLS?: boolean;
  username?: string;
  password?: string;
  saved?: boolean;
}

interface PhishingSettingsProps {
  scheduleSettings: ScheduleSettingsType;
  emailProvider: string;
  apiConfig: EmailAPIConfig;
  aiConfig: AIConfig;
  showApiKey: boolean;
  onScheduleSettingsChange: (settings: ScheduleSettingsType) => void;
  onEmailProviderChange: (provider: string) => void;
  onAPIConfigChange: (config: EmailAPIConfig) => void;
  onAIConfigChange: (config: AIConfig) => void;
  onToggleApiKey: () => void;
  onSaveAPIConfig: () => void;
  onSaveAllSettings: () => void;
}

export const PhishingSettings: React.FC<PhishingSettingsProps> = ({
  scheduleSettings,
  emailProvider,
  apiConfig,
  aiConfig,
  showApiKey,
  onScheduleSettingsChange,
  onEmailProviderChange,
  onAPIConfigChange,
  onAIConfigChange,
  onToggleApiKey,
  onSaveAPIConfig,
  onSaveAllSettings
}) => {
  return (
    <Card className="p-6 rounded-xl border-0 shadow-lg overflow-hidden">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Campaign Settings</h2>
        <p className="text-sm text-muted-foreground">Configure default settings for phishing campaigns</p>
      </div>
      
      <div className="mt-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule Settings */}
          <ScheduleSettings
            settings={scheduleSettings}
            onSettingsChange={onScheduleSettingsChange}
          />
          
          {/* API Configuration */}
          <EmailAPISettings
            emailProvider={emailProvider}
            apiConfig={apiConfig}
            showApiKey={showApiKey}
            onProviderChange={onEmailProviderChange}
            onConfigChange={onAPIConfigChange}
            onToggleApiKey={onToggleApiKey}
            onSave={onSaveAPIConfig}
          />
        </div>
        
        {/* AI Configuration Settings */}
        <AISettings
          aiConfig={aiConfig}
          showApiKey={showApiKey}
          onConfigChange={onAIConfigChange}
          onToggleApiKey={onToggleApiKey}
        />
        
        {/* Notification Settings */}
        <NotificationSettings />
        
        <div className="flex justify-end">
          <Button 
            className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
            onClick={onSaveAllSettings}
          >
            <Save className="mr-2 h-4 w-4" />
            Save All Settings
          </Button>
        </div>
      </div>
    </Card>
  );
};