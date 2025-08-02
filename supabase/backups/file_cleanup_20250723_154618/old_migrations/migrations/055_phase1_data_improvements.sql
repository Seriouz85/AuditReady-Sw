-- Migration: Phase 1 - Data Integrity, Classification, and Security Improvements
-- Purpose: Implement critical data governance and security enhancements

-- 1. Add data classification and governance fields to organization_requirements
ALTER TABLE organization_requirements 
ADD COLUMN IF NOT EXISTS data_classification TEXT DEFAULT 'internal' 
    CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
ADD COLUMN IF NOT EXISTS retention_date DATE,
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'user_input'
    CHECK (data_source IN ('user_input', 'import', 'api', 'integration', 'migration')),
ADD COLUMN IF NOT EXISTS compliance_status TEXT DEFAULT 'pending_review'
    CHECK (compliance_status IN ('pending_review', 'in_review', 'approved', 'rejected', 'archived')),
ADD COLUMN IF NOT EXISTS contains_pii BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_encrypted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS legal_basis TEXT,
ADD COLUMN IF NOT EXISTS anonymization_date DATE;

-- 2. Add workflow and approval fields
ALTER TABLE organization_requirements
ADD COLUMN IF NOT EXISTS workflow_state TEXT DEFAULT 'draft'
    CHECK (workflow_state IN ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'archived')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_cycle_months INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS next_review_date DATE GENERATED ALWAYS AS (
    CASE 
        WHEN approved_at IS NOT NULL AND review_cycle_months IS NOT NULL 
        THEN (approved_at + (review_cycle_months || ' months')::INTERVAL)::DATE
        ELSE NULL
    END
) STORED;

-- 3. Add maturity assessment fields
ALTER TABLE organization_requirements
ADD COLUMN IF NOT EXISTS maturity_level INTEGER CHECK (maturity_level BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS maturity_target INTEGER CHECK (maturity_target BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS gap_analysis JSONB;

-- 4. Add version control
ALTER TABLE organization_requirements
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS version_comment TEXT;

-- 5. Fix nullable foreign keys for data integrity
-- First, update any NULL values to prevent constraint violations
UPDATE organization_requirements 
SET organization_id = '00000000-0000-0000-0000-000000000000' 
WHERE organization_id IS NULL;

UPDATE organization_requirements 
SET requirement_id = '00000000-0000-0000-0000-000000000000' 
WHERE requirement_id IS NULL;

-- Now add NOT NULL constraints
ALTER TABLE organization_requirements 
ALTER COLUMN organization_id SET NOT NULL,
ALTER COLUMN requirement_id SET NOT NULL;

-- 6. Add evidence file size constraint
ALTER TABLE organization_requirements 
ADD CONSTRAINT evidence_files_size_limit 
CHECK (pg_column_size(evidence_files) < 10485760); -- 10MB limit

-- 7. Create requirement interactions table for usage analytics
CREATE TABLE IF NOT EXISTS requirement_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES requirements_library(id),
    user_id UUID NOT NULL,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN (
        'view', 'update', 'comment', 'attach_evidence', 'status_change', 
        'assign', 'approve', 'reject', 'export', 'print'
    )),
    metadata JSONB,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_interactions_org_time ON requirement_interactions(organization_id, created_at DESC);
CREATE INDEX idx_interactions_user_time ON requirement_interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_requirement ON requirement_interactions(requirement_id, created_at DESC);
CREATE INDEX idx_interactions_type ON requirement_interactions(interaction_type, created_at DESC);

-- 8. Create data quality monitoring table
CREATE TABLE IF NOT EXISTS data_quality_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    issue_type TEXT NOT NULL CHECK (issue_type IN (
        'missing_required_field', 'invalid_data_format', 'outdated_information',
        'duplicate_data', 'inconsistent_data', 'security_concern'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    suggested_fix TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_quality_issues_org ON data_quality_issues(organization_id, is_resolved, created_at DESC);

-- 9. Add organization-level settings for data governance
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS data_retention_policy JSONB DEFAULT '{
    "default_retention_years": 7,
    "pii_retention_years": 3,
    "audit_trail_retention_years": 10,
    "automatic_anonymization": false
}'::JSONB,
ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{
    "require_mfa_for_restore": true,
    "require_approval_for_bulk_operations": true,
    "encryption_at_rest": true,
    "audit_level": "comprehensive"
}'::JSONB,
ADD COLUMN IF NOT EXISTS compliance_settings JSONB DEFAULT '{
    "gdpr_enabled": true,
    "ccpa_enabled": true,
    "data_residency": "eu",
    "right_to_be_forgotten": true
}'::JSONB;

-- 10. Create index for performance on new fields
CREATE INDEX idx_org_req_workflow ON organization_requirements(workflow_state, organization_id);
CREATE INDEX idx_org_req_classification ON organization_requirements(data_classification, organization_id);
CREATE INDEX idx_org_req_compliance ON organization_requirements(compliance_status, organization_id);
CREATE INDEX idx_org_req_review ON organization_requirements(next_review_date) 
    WHERE next_review_date IS NOT NULL;

-- 11. Add trigger to update version on changes
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD IS DISTINCT FROM NEW THEN
        NEW.version = OLD.version + 1;
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_requirement_version
    BEFORE UPDATE ON organization_requirements
    FOR EACH ROW
    EXECUTE FUNCTION increment_version();

-- 12. Enable RLS on new tables
ALTER TABLE requirement_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_issues ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their organization's interactions"
    ON requirement_interactions FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY "Users can create interactions for their organization"
    ON requirement_interactions FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY "Users can view their organization's data quality issues"
    ON data_quality_issues FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

-- 13. Grant permissions
GRANT SELECT, INSERT ON requirement_interactions TO authenticated;
GRANT ALL ON data_quality_issues TO authenticated;

-- Add helpful comments
COMMENT ON COLUMN organization_requirements.data_classification IS 'Data sensitivity classification for security and compliance';
COMMENT ON COLUMN organization_requirements.workflow_state IS 'Current state in the approval workflow';
COMMENT ON COLUMN organization_requirements.maturity_level IS 'Current maturity level (1-5 scale) for this requirement';
COMMENT ON COLUMN organization_requirements.version IS 'Version number, automatically incremented on updates';
COMMENT ON TABLE requirement_interactions IS 'Track all user interactions with requirements for analytics and usage patterns';
COMMENT ON TABLE data_quality_issues IS 'Monitor and track data quality issues for continuous improvement';