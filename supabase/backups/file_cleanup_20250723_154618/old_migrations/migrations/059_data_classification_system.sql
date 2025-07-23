-- Data Classification System
-- Comprehensive data governance and Azure Purview integration

-- Classification Labels Table
CREATE TABLE IF NOT EXISTS organization_data_classification_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    label_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    parent_id VARCHAR(255), -- For hierarchical labels
    confidentiality_level VARCHAR(50) NOT NULL DEFAULT 'internal',
    retention_period INTEGER, -- days
    is_built_in BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT uk_org_label_id UNIQUE (organization_id, label_id),
    CONSTRAINT chk_confidentiality_level CHECK (confidentiality_level IN ('public', 'internal', 'confidential', 'restricted', 'top_secret'))
);

-- Sensitive Data Detections Table
CREATE TABLE IF NOT EXISTS organization_sensitive_data_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    detected_types TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    locations JSONB NOT NULL DEFAULT '[]'::JSONB,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_confidence CHECK (confidence >= 0.0 AND confidence <= 1.0)
);

-- Retention Policies Table
CREATE TABLE IF NOT EXISTS organization_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    retention_period INTEGER NOT NULL, -- days
    action VARCHAR(50) NOT NULL DEFAULT 'notify',
    applies_to TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], -- classification label IDs
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_retention_action CHECK (action IN ('delete', 'archive', 'notify'))
);

-- Data Policies Table (DLP, Access Control, etc.)
CREATE TABLE IF NOT EXISTS organization_data_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    rules JSONB NOT NULL DEFAULT '[]'::JSONB,
    is_active BOOLEAN DEFAULT true,
    applies_to TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_policy_type CHECK (type IN ('retention', 'dlp', 'access', 'encryption'))
);

-- Add classification columns to documents table
DO $$
BEGIN
    -- Add classification_label column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='documents' 
        AND column_name='classification_label'
    ) THEN
        ALTER TABLE documents ADD COLUMN classification_label VARCHAR(255);
    END IF;
    
    -- Add classification_confidence column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='documents' 
        AND column_name='classification_confidence'
    ) THEN
        ALTER TABLE documents ADD COLUMN classification_confidence DECIMAL(3,2) DEFAULT 0.0;
    END IF;
    
    -- Add auto_classified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='documents' 
        AND column_name='auto_classified'
    ) THEN
        ALTER TABLE documents ADD COLUMN auto_classified BOOLEAN DEFAULT false;
    END IF;
    
    -- Add retention_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='documents' 
        AND column_name='retention_date'
    ) THEN
        ALTER TABLE documents ADD COLUMN retention_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add sensitivity_score column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='documents' 
        AND column_name='sensitivity_score'
    ) THEN
        ALTER TABLE documents ADD COLUMN sensitivity_score DECIMAL(3,2) DEFAULT 0.0;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_classification_labels_org_id ON organization_data_classification_labels(organization_id);
CREATE INDEX IF NOT EXISTS idx_classification_labels_label_id ON organization_data_classification_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_classification_labels_confidentiality ON organization_data_classification_labels(confidentiality_level);

CREATE INDEX IF NOT EXISTS idx_sensitive_detections_org_id ON organization_sensitive_data_detections(organization_id);
CREATE INDEX IF NOT EXISTS idx_sensitive_detections_types ON organization_sensitive_data_detections USING GIN(detected_types);
CREATE INDEX IF NOT EXISTS idx_sensitive_detections_confidence ON organization_sensitive_data_detections(confidence);
CREATE INDEX IF NOT EXISTS idx_sensitive_detections_scanned_at ON organization_sensitive_data_detections(scanned_at);

CREATE INDEX IF NOT EXISTS idx_retention_policies_org_id ON organization_retention_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_retention_policies_active ON organization_retention_policies(is_active);

CREATE INDEX IF NOT EXISTS idx_data_policies_org_id ON organization_data_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_policies_type ON organization_data_policies(type);
CREATE INDEX IF NOT EXISTS idx_data_policies_active ON organization_data_policies(is_active);

CREATE INDEX IF NOT EXISTS idx_documents_classification ON documents(classification_label);
CREATE INDEX IF NOT EXISTS idx_documents_sensitivity ON documents(sensitivity_score);
CREATE INDEX IF NOT EXISTS idx_documents_retention_date ON documents(retention_date);

-- Row Level Security Policies
ALTER TABLE organization_data_classification_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_sensitive_data_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_data_policies ENABLE ROW LEVEL SECURITY;

-- Classification Labels RLS
CREATE POLICY "Users can view classification labels for their organization"
    ON organization_data_classification_labels FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage classification labels for their organization"
    ON organization_data_classification_labels FOR ALL
    USING (
        organization_id IN (
            SELECT uo.organization_id FROM user_organizations uo
            JOIN organization_roles or_role ON uo.role_id = or_role.id
            WHERE uo.user_id = auth.uid()
            AND or_role.permissions ? 'manage_data_classification'
        )
    );

-- Sensitive Data Detections RLS
CREATE POLICY "Users can view sensitive data detections for their organization"
    ON organization_sensitive_data_detections FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert sensitive data detections"
    ON organization_sensitive_data_detections FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

-- Retention Policies RLS
CREATE POLICY "Users can view retention policies for their organization"
    ON organization_retention_policies FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage retention policies for their organization"
    ON organization_retention_policies FOR ALL
    USING (
        organization_id IN (
            SELECT uo.organization_id FROM user_organizations uo
            JOIN organization_roles or_role ON uo.role_id = or_role.id
            WHERE uo.user_id = auth.uid()
            AND (or_role.permissions ? 'manage_data_policies' OR or_role.permissions ? 'admin')
        )
    );

-- Data Policies RLS
CREATE POLICY "Users can view data policies for their organization"
    ON organization_data_policies FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM user_organizations 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage data policies for their organization"
    ON organization_data_policies FOR ALL
    USING (
        organization_id IN (
            SELECT uo.organization_id FROM user_organizations uo
            JOIN organization_roles or_role ON uo.role_id = or_role.id
            WHERE uo.user_id = auth.uid()
            AND (or_role.permissions ? 'manage_data_policies' OR or_role.permissions ? 'admin')
        )
    );

-- Functions for data classification automation

-- Function to automatically apply retention dates based on classification
CREATE OR REPLACE FUNCTION apply_retention_policy()
RETURNS TRIGGER AS $$
BEGIN
    -- Apply retention date based on classification label
    IF NEW.classification_label IS NOT NULL THEN
        -- Get retention period for this classification
        SELECT 
            CASE 
                WHEN NEW.classification_label = 'public' THEN CURRENT_DATE + INTERVAL '365 days'
                WHEN NEW.classification_label = 'internal' THEN CURRENT_DATE + INTERVAL '2555 days' -- 7 years
                WHEN NEW.classification_label = 'confidential' THEN CURRENT_DATE + INTERVAL '1825 days' -- 5 years
                WHEN NEW.classification_label = 'restricted' THEN CURRENT_DATE + INTERVAL '3650 days' -- 10 years
                WHEN NEW.classification_label = 'pii' THEN CURRENT_DATE + INTERVAL '1095 days' -- 3 years (GDPR)
                WHEN NEW.classification_label = 'financial' THEN CURRENT_DATE + INTERVAL '2555 days' -- 7 years
                ELSE CURRENT_DATE + INTERVAL '2555 days' -- Default 7 years
            END
        INTO NEW.retention_date;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic retention policy application
DROP TRIGGER IF EXISTS trigger_apply_retention_policy ON documents;
CREATE TRIGGER trigger_apply_retention_policy
    BEFORE INSERT OR UPDATE OF classification_label ON documents
    FOR EACH ROW
    EXECUTE FUNCTION apply_retention_policy();

-- Function to initialize default classification labels for an organization
CREATE OR REPLACE FUNCTION initialize_default_classification_labels(p_organization_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO organization_data_classification_labels (
        organization_id, label_id, name, display_name, description, color, 
        confidentiality_level, retention_period, is_built_in
    ) VALUES
    (p_organization_id, 'public', 'Public', 'Public', 'Information that can be shared publicly', '#22c55e', 'public', 365, true),
    (p_organization_id, 'internal', 'Internal', 'Internal Use Only', 'Information for internal use within the organization', '#3b82f6', 'internal', 2555, true),
    (p_organization_id, 'confidential', 'Confidential', 'Confidential', 'Sensitive information requiring protection', '#f59e0b', 'confidential', 1825, true),
    (p_organization_id, 'restricted', 'Restricted', 'Restricted', 'Highly sensitive information with strict access controls', '#ef4444', 'restricted', 3650, true),
    (p_organization_id, 'pii', 'Personal Information', 'Personal Information (PII)', 'Personally identifiable information subject to GDPR/CCPA', '#8b5cf6', 'restricted', 1095, true),
    (p_organization_id, 'financial', 'Financial Data', 'Financial Information', 'Financial records and sensitive financial information', '#dc2626', 'restricted', 2555, true)
    ON CONFLICT (organization_id, label_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to get compliance dashboard data
CREATE OR REPLACE FUNCTION get_compliance_dashboard_data(p_organization_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_documents', (
            SELECT COUNT(*) FROM documents WHERE organization_id = p_organization_id
        ),
        'classified_documents', (
            SELECT COUNT(*) FROM documents 
            WHERE organization_id = p_organization_id 
            AND classification_label IS NOT NULL
        ),
        'sensitive_detections', (
            SELECT COUNT(*) FROM organization_sensitive_data_detections 
            WHERE organization_id = p_organization_id
        ),
        'high_risk_detections', (
            SELECT COUNT(*) FROM organization_sensitive_data_detections 
            WHERE organization_id = p_organization_id 
            AND confidence >= 0.8
        ),
        'retention_violations', (
            SELECT COUNT(*) FROM documents 
            WHERE organization_id = p_organization_id 
            AND retention_date < CURRENT_DATE
        ),
        'classification_distribution', (
            SELECT json_object_agg(
                COALESCE(classification_label, 'unclassified'), 
                count
            )
            FROM (
                SELECT 
                    classification_label,
                    COUNT(*) as count
                FROM documents 
                WHERE organization_id = p_organization_id
                GROUP BY classification_label
            ) t
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Initialize demo organization with default classification labels
DO $$
BEGIN
    -- Initialize for demo organization
    PERFORM initialize_default_classification_labels('34adc4bb-d1e7-43bd-8249-89c76520533d');
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if organization doesn't exist
        NULL;
END $$;

-- Add permissions for data classification management
DO $$
BEGIN
    -- Add new permissions to organization_roles if they don't exist
    UPDATE organization_roles 
    SET permissions = permissions || 
        CASE 
            WHEN permissions ? 'admin' THEN 
                '["manage_data_classification", "manage_data_policies", "view_sensitive_data"]'::jsonb
            WHEN permissions ? 'manager' THEN 
                '["manage_data_classification", "view_sensitive_data"]'::jsonb
            WHEN permissions ? 'user' THEN 
                '["view_data_classification"]'::jsonb
            ELSE '[]'::jsonb
        END
    WHERE NOT (permissions ? 'manage_data_classification');
END $$;

-- Refresh schema
NOTIFY pgrst, 'reload schema';