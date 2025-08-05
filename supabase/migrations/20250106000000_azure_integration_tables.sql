-- Azure Integration Tables
-- This migration creates tables for Azure application sync integration

-- Azure connections table to store Azure credentials and sync settings
CREATE TABLE IF NOT EXISTS azure_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tenant_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    subscription_id TEXT NOT NULL,
    sync_frequency TEXT NOT NULL CHECK (sync_frequency IN ('hourly', 'daily', 'weekly')),
    sync_enabled BOOLEAN NOT NULL DEFAULT true,
    last_sync TIMESTAMPTZ,
    next_sync TIMESTAMPTZ,
    connection_status TEXT NOT NULL DEFAULT 'disconnected' CHECK (connection_status IN ('connected', 'disconnected', 'error', 'syncing')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one connection per organization
    UNIQUE(organization_id)
);

-- Azure applications table to store synced Azure applications
CREATE TABLE IF NOT EXISTS azure_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    azure_app_id TEXT NOT NULL,
    name TEXT NOT NULL,
    resource_group TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    subscription_id TEXT NOT NULL,
    subscription_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('running', 'stopped', 'error', 'unknown')),
    last_modified TIMESTAMPTZ NOT NULL,
    tags JSONB DEFAULT '{}',
    resource_id TEXT NOT NULL,
    compliance_status TEXT CHECK (compliance_status IN ('compliant', 'non_compliant', 'unknown')),
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique applications per organization
    UNIQUE(organization_id, azure_app_id)
);

-- Azure sync logs table to track sync history
CREATE TABLE IF NOT EXISTS azure_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'scheduled')),
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    applications_synced INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_azure_connections_org_id ON azure_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_azure_connections_status ON azure_connections(connection_status);
CREATE INDEX IF NOT EXISTS idx_azure_connections_next_sync ON azure_connections(next_sync) WHERE sync_enabled = true;

CREATE INDEX IF NOT EXISTS idx_azure_applications_org_id ON azure_applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_azure_applications_resource_group ON azure_applications(organization_id, resource_group);
CREATE INDEX IF NOT EXISTS idx_azure_applications_status ON azure_applications(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_azure_applications_compliance ON azure_applications(organization_id, compliance_status);
CREATE INDEX IF NOT EXISTS idx_azure_applications_risk ON azure_applications(organization_id, risk_level);

CREATE INDEX IF NOT EXISTS idx_azure_sync_logs_org_id ON azure_sync_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_azure_sync_logs_status ON azure_sync_logs(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_azure_sync_logs_started_at ON azure_sync_logs(started_at);

-- Enable RLS (Row Level Security)
ALTER TABLE azure_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE azure_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE azure_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for azure_connections
CREATE POLICY "Users can view their organization's Azure connections" ON azure_connections
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage their organization's Azure connections" ON azure_connections
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'ciso')
        )
    );

-- RLS Policies for azure_applications
CREATE POLICY "Users can view their organization's Azure applications" ON azure_applications
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage Azure applications" ON azure_applications
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'ciso')
        )
    );

-- RLS Policies for azure_sync_logs
CREATE POLICY "Users can view their organization's Azure sync logs" ON azure_sync_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can create Azure sync logs" ON azure_sync_logs
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_organization_roles 
            WHERE user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_azure_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_azure_connections_updated_at
    BEFORE UPDATE ON azure_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_azure_updated_at();

CREATE TRIGGER update_azure_applications_updated_at
    BEFORE UPDATE ON azure_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_azure_updated_at();

-- Add helpful comments
COMMENT ON TABLE azure_connections IS 'Stores Azure integration connection settings and credentials for organizations';
COMMENT ON TABLE azure_applications IS 'Stores Azure applications synced from Azure subscriptions';
COMMENT ON TABLE azure_sync_logs IS 'Tracks Azure sync operations and their results';

COMMENT ON COLUMN azure_connections.tenant_id IS 'Azure AD Tenant ID';
COMMENT ON COLUMN azure_connections.client_id IS 'Azure Application (Client) ID';
COMMENT ON COLUMN azure_connections.subscription_id IS 'Azure Subscription ID to sync from';
COMMENT ON COLUMN azure_connections.sync_frequency IS 'How often to automatically sync applications';
COMMENT ON COLUMN azure_connections.sync_enabled IS 'Whether automatic sync is enabled';
COMMENT ON COLUMN azure_connections.connection_status IS 'Current status of the Azure connection';

COMMENT ON COLUMN azure_applications.azure_app_id IS 'Azure resource ID or unique identifier';
COMMENT ON COLUMN azure_applications.resource_group IS 'Azure Resource Group name';
COMMENT ON COLUMN azure_applications.type IS 'Azure resource type (e.g., Microsoft.Web/sites)';
COMMENT ON COLUMN azure_applications.tags IS 'Azure resource tags as JSON';
COMMENT ON COLUMN azure_applications.compliance_status IS 'Compliance assessment status of the application';
COMMENT ON COLUMN azure_applications.risk_level IS 'Risk level assessment of the application';