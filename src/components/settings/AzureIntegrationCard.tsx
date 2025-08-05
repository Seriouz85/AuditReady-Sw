import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Settings, 
  CheckCircle, 
  UserPlus,
  AlertTriangle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AzureIntegrationSettings } from '@/components/settings/AzureIntegrationSettings';
import { IntegrationIcon } from '@/components/ui/IntegrationIcon';

interface AzureIntegrationCardProps {
  organizationId: string;
}

export function AzureIntegrationCard({ organizationId }: AzureIntegrationCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isDemo = user?.email === 'demo@auditready.com';
  
  const [isConnected, setIsConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // For demo account, show as connected
    if (isDemo) {
      setIsConnected(true);
    } else {
      // In production, check actual connection status
      checkConnectionStatus();
    }
  }, [isDemo]);

  const checkConnectionStatus = async () => {
    try {
      // In production, check if Azure integration is configured
      // For now, default to not connected
      setIsConnected(false);
    } catch (error) {
      console.error('Error checking Azure connection status:', error);
      setIsConnected(false);
    }
  };

  const handleConnect = () => {
    if (isDemo) {
      // For demo, just show the settings panel
      setShowSettings(true);
    } else {
      // Open the settings panel for configuration
      setShowSettings(true);
    }
  };

  const handleManage = () => {
    console.log('Manage button clicked - opening settings panel');
    console.log('Current showSettings state:', showSettings);
    setShowSettings(true);
    console.log('Settings panel should now be visible');
    
    // Also show a toast to confirm the button works
    if (toast) {
      toast({
        title: "Azure Settings",
        description: "Opening Azure integration settings...",
      });
    }
  };

  const handleDisconnect = () => {
    if (isDemo) {
      toast({
        title: "Demo Mode",
        description: "Cannot disconnect Azure integration in demo mode",
        variant: "default"
      });
      return;
    }
    
    // In production, handle disconnection
    setIsConnected(false);
    setShowSettings(false);
    toast({
      title: "Success",
      description: "Azure integration disconnected",
      variant: "default"
    });
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // Integration card view
  if (!showSettings) {
    return (
      <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-3 mb-2">
          <IntegrationIcon provider="azure" size="medium" />
          <div>
            <h4 className="font-semibold">Microsoft Azure</h4>
            <p className="text-xs text-muted-foreground">Cloud Security</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Connect with Azure for security monitoring
            </p>
          </div>
          <div>
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={handleManage}
              >
                <Settings className="w-3 h-3 mr-1" />
                Manage
              </Button>
              {!isDemo && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDisconnect}
                  className="text-red-600 hover:text-red-700"
                >
                  Disconnect
                </Button>
              )}
            </>
          ) : (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={handleConnect}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Connect
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Expanded settings view - takes over the entire integrations card area
  return (
    <div className="col-span-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div className="flex items-center gap-3">
          <IntegrationIcon provider="azure" size="small" />
          <div>
            <h2 className="text-lg font-semibold">Microsoft Azure Integration</h2>
            <p className="text-xs text-muted-foreground">
              Configure Azure sync and compliance monitoring
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCloseSettings}
          className="flex items-center gap-2"
        >
          <X className="w-3 h-3" />
          Back
        </Button>
      </div>

      {/* Compact Status Banner */}
      <div className="mb-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-azure-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Cloud className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-blue-900">
                {isConnected ? 'Azure Integration Active' : 'Setup Required'}
              </div>
              <div className="text-xs text-blue-700">
                {isConnected 
                  ? 'Syncing compliance data automatically'
                  : 'Connect to enable monitoring'
                }
              </div>
            </div>
          </div>
          {isConnected && (
            <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="bg-white rounded-lg border">
        <AzureIntegrationSettings organizationId={organizationId} />
      </div>
    </div>
  );
}