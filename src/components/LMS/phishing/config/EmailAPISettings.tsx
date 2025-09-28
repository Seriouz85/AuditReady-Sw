import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Save } from 'lucide-react';

interface EmailAPIConfig {
  apiKey: string;
  smtpHost?: string;
  smtpPort?: number;
  useTLS?: boolean;
  username?: string;
  password?: string;
  saved?: boolean;
}

interface EmailAPISettingsProps {
  emailProvider: string;
  apiConfig: EmailAPIConfig;
  showApiKey: boolean;
  onProviderChange: (provider: string) => void;
  onConfigChange: (config: EmailAPIConfig) => void;
  onToggleApiKey: () => void;
  onSave: () => void;
}

export const EmailAPISettings: React.FC<EmailAPISettingsProps> = ({
  emailProvider,
  apiConfig,
  showApiKey,
  onProviderChange,
  onConfigChange,
  onToggleApiKey,
  onSave
}) => {
  const updateConfig = (updates: Partial<EmailAPIConfig>) => {
    onConfigChange({ ...apiConfig, ...updates });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Email API Configuration</h3>
      <p className="text-sm text-muted-foreground">
        Connect to an email service provider to send phishing simulation emails.
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="apiProvider">Email Provider</Label>
          <Select value={emailProvider} onValueChange={onProviderChange}>
            <SelectTrigger id="apiProvider" className="mt-1 rounded-xl">
              <SelectValue placeholder="Select email provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sendgrid">SendGrid</SelectItem>
              <SelectItem value="mailchimp">Mailchimp</SelectItem>
              <SelectItem value="mailgun">Mailgun</SelectItem>
              <SelectItem value="amazon-ses">Amazon SES</SelectItem>
              <SelectItem value="microsoft-graph">Microsoft Graph API</SelectItem>
              <SelectItem value="custom">Custom SMTP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="apiKey">API Key / Connection String</Label>
          <div className="mt-1 relative">
            <Input 
              id="apiKey" 
              type="password" 
              className="rounded-xl font-mono text-sm pr-16"
              value={apiConfig.apiKey}
              onChange={(e) => updateConfig({ apiKey: e.target.value })}
              placeholder="Enter your API key"
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
        </div>
        
        {emailProvider === 'custom' && (
          <div className="space-y-4 border rounded-xl p-4">
            <div>
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input 
                id="smtpHost" 
                className="mt-1 rounded-xl"
                value={apiConfig.smtpHost || ''}
                onChange={(e) => updateConfig({ smtpHost: e.target.value })}
                placeholder="smtp.example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input 
                id="smtpPort" 
                type="number" 
                className="mt-1 rounded-xl"
                value={apiConfig.smtpPort || 587}
                onChange={(e) => updateConfig({ smtpPort: parseInt(e.target.value) || 587 })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="useTLS" className="cursor-pointer">Use TLS</Label>
              </div>
              <Switch 
                id="useTLS"
                checked={apiConfig.useTLS || false}
                onCheckedChange={(checked) => updateConfig({ useTLS: checked })}
              />
            </div>
            
            <div>
              <Label htmlFor="smtpUsername">Username</Label>
              <Input 
                id="smtpUsername" 
                className="mt-1 rounded-xl"
                value={apiConfig.username || ''}
                onChange={(e) => updateConfig({ username: e.target.value })}
                placeholder="smtp username"
              />
            </div>
            
            <div>
              <Label htmlFor="smtpPassword">Password</Label>
              <Input 
                id="smtpPassword" 
                type="password" 
                className="mt-1 rounded-xl"
                value={apiConfig.password || ''}
                onChange={(e) => updateConfig({ password: e.target.value })}
                placeholder="smtp password"
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
            Connection Status: OK
          </Button>
          
          <Button 
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
            onClick={onSave}
          >
            <Save className="mr-2 h-4 w-4" />
            Save API Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};