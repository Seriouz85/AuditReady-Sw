import React, { useState } from 'react';
import { toast } from 'sonner';
import { EnhancedApplication, RequirementFulfillment } from '@/types/applications';
import { AzureApplicationDetailView } from './AzureApplicationDetailView';
import { enhancedApplications } from '@/data/mockData';

interface DemoIntegrationProps {
  applicationId?: string;
  className?: string;
}

export const AzureApplicationDemo: React.FC<DemoIntegrationProps> = ({
  applicationId = 'app-azure-1', // Default to Customer Data Platform
  className = '',
}) => {
  const [application, setApplication] = useState<EnhancedApplication | null>(
    () => enhancedApplications.find(app => app.id === applicationId && app.syncMode === 'azure') || null
  );

  if (!application) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Azure application not found or not configured for sync.</p>
      </div>
    );
  }

  const handleUpdateRequirement = (requirementId: string, updates: Partial<RequirementFulfillment>) => {
    setApplication(prev => {
      if (!prev || !prev.requirementFulfillments) return prev;

      const updatedRequirements = prev.requirementFulfillments.map(req =>
        req.id === requirementId ? { ...req, ...updates } : req
      );

      toast.success('Requirement updated successfully', {
        description: `${requirementId} has been updated with manual override.`,
      });

      return {
        ...prev,
        requirementFulfillments: updatedRequirements,
        // Update manual overrides count in Azure metadata
        azureSyncMetadata: prev.azureSyncMetadata ? {
          ...prev.azureSyncMetadata,
          manualOverrides: updatedRequirements.filter(r => r.isManualOverride).length,
        } : undefined,
      };
    });
  };

  const handleViewRequirementDetails = (requirementId: string) => {
    toast.info('Requirement Details', {
      description: `Opening detailed view for ${requirementId}. In a real application, this would navigate to the requirement details page.`,
    });
  };

  const handleRefreshSync = () => {
    if (!application?.azureSyncMetadata) return;

    // Simulate sync in progress
    setApplication(prev => prev ? {
      ...prev,
      azureSyncMetadata: prev.azureSyncMetadata ? {
        ...prev.azureSyncMetadata,
        syncStatus: 'pending' as const,
      } : undefined,
    } : null);

    toast.info('Sync initiated', {
      description: 'Azure synchronization has been started...',
    });

    // Simulate sync completion after 3 seconds
    setTimeout(() => {
      setApplication(prev => prev ? {
        ...prev,
        azureSyncMetadata: prev.azureSyncMetadata ? {
          ...prev.azureSyncMetadata,
          syncStatus: 'synced' as const,
          lastSyncDate: new Date().toISOString(),
          lastSuccessfulSync: new Date().toISOString(),
        } : undefined,
      } : null);

      toast.success('Sync completed', {
        description: 'Azure synchronization completed successfully. All requirements have been re-evaluated.',
      });
    }, 3000);
  };

  const handleViewInAzure = () => {
    if (application?.azureSyncMetadata?.azureResourceId) {
      const portalUrl = `https://portal.azure.com/#@/resource${application.azureSyncMetadata.azureResourceId}/overview`;
      
      toast.info('Opening Azure Portal', {
        description: 'Redirecting to Azure Portal for this resource...',
      });

      // In a real application, you would use:
      // window.open(portalUrl, '_blank');
      
      // For demo purposes, we'll just show the URL
      console.log('Would open:', portalUrl);
    }
  };

  return (
    <div className={className}>
      <AzureApplicationDetailView
        application={application}
        onUpdateRequirement={handleUpdateRequirement}
        onViewRequirementDetails={handleViewRequirementDetails}
        onRefreshSync={handleRefreshSync}
        onViewInAzure={handleViewInAzure}
      />
    </div>
  );
};

// Export component variations for different Azure applications
export const CustomerDataPlatformDemo: React.FC<{ className?: string }> = ({ className }) => (
  <AzureApplicationDemo applicationId="app-azure-1" className={className} />
);

export const EnterpriseAPIGatewayDemo: React.FC<{ className?: string }> = ({ className }) => (
  <AzureApplicationDemo applicationId="app-azure-2" className={className} />
);

export const FinancialDataLakeDemo: React.FC<{ className?: string }> = ({ className }) => (
  <AzureApplicationDemo applicationId="app-azure-3" className={className} />
);

export const CustomerMobileAppDemo: React.FC<{ className?: string }> = ({ className }) => (
  <AzureApplicationDemo applicationId="app-azure-4" className={className} />
);

export const IoTPlatformDemo: React.FC<{ className?: string }> = ({ className }) => (
  <AzureApplicationDemo applicationId="app-azure-5" className={className} />
);

export const DocumentManagementDemo: React.FC<{ className?: string }> = ({ className }) => (
  <AzureApplicationDemo applicationId="app-azure-6" className={className} />
);

export default AzureApplicationDemo;