import { supabase } from '@/lib/supabase';

export interface AzureApplication {
  id: string;
  name: string;
  resourceGroup: string;
  location: string;
  type: string;
  subscriptionId: string;
  subscriptionName: string;
  status: 'running' | 'stopped' | 'error' | 'unknown';
  lastModified: string;
  tags: Record<string, string>;
  resourceId: string;
  complianceStatus?: 'compliant' | 'non_compliant' | 'unknown';
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface AzureConnection {
  id: string;
  organizationId: string;
  tenantId: string;
  clientId: string;
  subscriptionId: string;
  syncFrequency: 'hourly' | 'daily' | 'weekly';
  syncEnabled: boolean;
  lastSync?: string;
  nextSync?: string;
  connectionStatus: 'connected' | 'disconnected' | 'error' | 'syncing';
  createdAt: string;
  updatedAt: string;
}

export interface AzureSyncStats {
  organizationId: string;
  totalApplications: number;
  syncedApplications: number;
  errorCount: number;
  lastSuccessfulSync?: string;
  averageSyncDuration: number;
}

class AzureApplicationService {
  private readonly baseUrl = 'https://management.azure.com';
  
  /**
   * Test Azure connection with provided credentials
   */
  async testConnection(tenantId: string, clientId: string, clientSecret: string): Promise<boolean> {
    try {
      // Get access token from Azure
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'https://management.azure.com/.default',
          grant_type: 'client_credentials',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Test the token by making a simple API call
      const testResponse = await fetch(`${this.baseUrl}/subscriptions?api-version=2020-01-01`, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      return testResponse.ok;
    } catch (error) {
      console.error('Azure connection test failed:', error);
      return false;
    }
  }

  /**
   * Save Azure connection configuration
   */
  async saveConnection(connection: Omit<AzureConnection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('azure_connections')
        .upsert({
          organization_id: connection.organizationId,
          tenant_id: connection.tenantId,
          client_id: connection.clientId,
          subscription_id: connection.subscriptionId,
          sync_frequency: connection.syncFrequency,
          sync_enabled: connection.syncEnabled,
          last_sync: connection.lastSync,
          next_sync: connection.nextSync,
          connection_status: connection.connectionStatus,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'organization_id'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving Azure connection:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error saving Azure connection:', error);
      throw error;
    }
  }

  /**
   * Get Azure connection for organization
   */
  async getConnection(organizationId: string): Promise<AzureConnection | null> {
    try {
      const { data, error } = await supabase
        .from('azure_connections')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No connection found
          return null;
        }
        console.error('Error fetching Azure connection:', error);
        throw error;
      }

      return {
        id: data.id,
        organizationId: data.organization_id,
        tenantId: data.tenant_id,
        clientId: data.client_id,
        subscriptionId: data.subscription_id,
        syncFrequency: data.sync_frequency,
        syncEnabled: data.sync_enabled,
        lastSync: data.last_sync,
        nextSync: data.next_sync,
        connectionStatus: data.connection_status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error getting Azure connection:', error);
      throw error;
    }
  }

  /**
   * Sync Azure applications for an organization
   */
  async syncApplications(organizationId: string): Promise<AzureApplication[]> {
    try {
      const connection = await this.getConnection(organizationId);
      if (!connection) {
        throw new Error('No Azure connection configured');
      }

      // Update connection status to syncing
      await this.updateConnectionStatus(organizationId, 'syncing');

      // In production, this would call Azure APIs to fetch applications
      // For now, we'll simulate the sync process
      
      const applications = await this.fetchApplicationsFromAzure(connection);
      
      // Store applications in database
      await this.storeApplications(organizationId, applications);
      
      // Update connection status and sync time
      await this.updateConnectionStatus(organizationId, 'connected', new Date().toISOString());
      
      return applications;
    } catch (error) {
      console.error('Error syncing Azure applications:', error);
      await this.updateConnectionStatus(organizationId, 'error');
      throw error;
    }
  }

  /**
   * Fetch applications from Azure (placeholder implementation)
   */
  private async fetchApplicationsFromAzure(connection: AzureConnection): Promise<AzureApplication[]> {
    // In production, this would use Azure SDK or REST API
    // For demo/development, return mock data
    return [
      {
        id: 'app-prod-web-01',
        name: 'Production Web App',
        resourceGroup: 'rg-production',
        location: 'East US',
        type: 'Microsoft.Web/sites',
        subscriptionId: connection.subscriptionId,
        subscriptionName: 'Production Subscription',
        status: 'running',
        lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        tags: { environment: 'production', owner: 'web-team' },
        resourceId: `/subscriptions/${connection.subscriptionId}/resourceGroups/rg-production/providers/Microsoft.Web/sites/prod-web-01`,
        complianceStatus: 'compliant',
        riskLevel: 'low'
      },
      {
        id: 'app-prod-api-01',
        name: 'Production API',
        resourceGroup: 'rg-production',
        location: 'East US',
        type: 'Microsoft.Web/sites',
        subscriptionId: connection.subscriptionId,
        subscriptionName: 'Production Subscription',
        status: 'running',
        lastModified: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        tags: { environment: 'production', owner: 'api-team' },
        resourceId: `/subscriptions/${connection.subscriptionId}/resourceGroups/rg-production/providers/Microsoft.Web/sites/prod-api-01`,
        complianceStatus: 'compliant',
        riskLevel: 'medium'
      },
      // Add more mock applications...
    ];
  }

  /**
   * Store synced applications in database
   */
  private async storeApplications(organizationId: string, applications: AzureApplication[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('azure_applications')
        .upsert(
          applications.map(app => ({
            organization_id: organizationId,
            azure_app_id: app.id,
            name: app.name,
            resource_group: app.resourceGroup,
            location: app.location,
            type: app.type,
            subscription_id: app.subscriptionId,
            subscription_name: app.subscriptionName,
            status: app.status,
            last_modified: app.lastModified,
            tags: app.tags,
            resource_id: app.resourceId,
            compliance_status: app.complianceStatus,
            risk_level: app.riskLevel,
            synced_at: new Date().toISOString(),
          })),
          {
            onConflict: 'organization_id,azure_app_id'
          }
        );

      if (error) {
        console.error('Error storing Azure applications:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error storing Azure applications:', error);
      throw error;
    }
  }

  /**
   * Update connection status
   */
  private async updateConnectionStatus(
    organizationId: string, 
    status: AzureConnection['connectionStatus'], 
    lastSync?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        connection_status: status,
        updated_at: new Date().toISOString(),
      };

      if (lastSync) {
        updateData.last_sync = lastSync;
        // Calculate next sync based on frequency
        const connection = await this.getConnection(organizationId);
        if (connection?.syncEnabled) {
          const nextSync = this.calculateNextSync(lastSync, connection.syncFrequency);
          updateData.next_sync = nextSync;
        }
      }

      const { error } = await supabase
        .from('azure_connections')
        .update(updateData)
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Error updating connection status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating connection status:', error);
      throw error;
    }
  }

  /**
   * Calculate next sync time based on frequency
   */
  private calculateNextSync(lastSync: string, frequency: AzureConnection['syncFrequency']): string {
    const lastSyncDate = new Date(lastSync);
    
    switch (frequency) {
      case 'hourly':
        return new Date(lastSyncDate.getTime() + 60 * 60 * 1000).toISOString();
      case 'daily':
        return new Date(lastSyncDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case 'weekly':
        return new Date(lastSyncDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(lastSyncDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  }

  /**
   * Get Azure applications for organization
   */
  async getApplications(organizationId: string): Promise<AzureApplication[]> {
    try {
      const { data, error } = await supabase
        .from('azure_applications')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) {
        console.error('Error fetching Azure applications:', error);
        throw error;
      }

      return data?.map(app => ({
        id: app.azure_app_id,
        name: app.name,
        resourceGroup: app.resource_group,
        location: app.location,
        type: app.type,
        subscriptionId: app.subscription_id,
        subscriptionName: app.subscription_name,
        status: app.status,
        lastModified: app.last_modified,
        tags: app.tags || {},
        resourceId: app.resource_id,
        complianceStatus: app.compliance_status,
        riskLevel: app.risk_level,
      })) || [];
    } catch (error) {
      console.error('Error getting Azure applications:', error);
      throw error;
    }
  }

  /**
   * Get sync statistics for organization
   */
  async getSyncStats(organizationId: string): Promise<AzureSyncStats> {
    try {
      const connection = await this.getConnection(organizationId);
      const applications = await this.getApplications(organizationId);
      
      return {
        organizationId,
        totalApplications: applications.length,
        syncedApplications: applications.length,
        errorCount: 0,
        lastSuccessfulSync: connection?.lastSync,
        averageSyncDuration: 45, // seconds
      };
    } catch (error) {
      console.error('Error getting sync stats:', error);
      throw error;
    }
  }

  /**
   * Delete Azure connection and all synced data
   */
  async deleteConnection(organizationId: string): Promise<void> {
    try {
      // Delete all synced applications first
      await supabase
        .from('azure_applications')
        .delete()
        .eq('organization_id', organizationId);

      // Delete the connection
      const { error } = await supabase
        .from('azure_connections')
        .delete()
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Error deleting Azure connection:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting Azure connection:', error);
      throw error;
    }
  }
}

export const azureApplicationService = new AzureApplicationService();