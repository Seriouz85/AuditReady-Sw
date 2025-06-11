-- ============================================================================
-- AuditReady Platform Database Schema
-- Enterprise-grade multi-tenant architecture with Row Level Security
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS AND TYPES
-- ============================================================================

CREATE TYPE standard_type AS ENUM ('framework', 'regulation', 'policy', 'guideline');
CREATE TYPE requirement_status AS ENUM ('fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable');
CREATE TYPE requirement_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE assessment_status AS ENUM ('draft', 'in-progress', 'completed', 'archived');
CREATE TYPE organization_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');
CREATE TYPE user_role AS ENUM ('platform_admin', 'organization_admin', 'compliance_manager', 'user', 'read_only');
CREATE TYPE notification_type AS ENUM ('requirement', 'assessment', 'application', 'device', 'location', 'organization', 'system');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ============================================================================
-- PLATFORM ADMINISTRATION TABLES
-- ============================================================================

-- Platform administrators (developers/operators)
CREATE TABLE platform_administrators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'platform_admin',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- System settings and configuration
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs for all platform activities
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID, -- Can be platform admin or organization user
    actor_type TEXT NOT NULL, -- 'platform_admin', 'organization_user'
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System settings for platform configuration
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    data_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    is_sensitive BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID REFERENCES platform_administrators(id)
);

-- ============================================================================
-- STANDARDS LIBRARY MANAGEMENT
-- ============================================================================

-- Central standards library
CREATE TABLE standards_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- 'iso-27001', 'cis-ig1'
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    type standard_type NOT NULL,
    description TEXT,
    category TEXT,
    official_source_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id),
    updated_by UUID REFERENCES platform_administrators(id)
);

-- Version tracking for standards
CREATE TABLE standard_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_id UUID REFERENCES standards_library(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL,
    release_date DATE,
    change_summary TEXT,
    migration_notes TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id)
);

-- Individual requirements/controls
CREATE TABLE requirements_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_id UUID REFERENCES standards_library(id) ON DELETE CASCADE,
    requirement_code TEXT NOT NULL, -- '4.1', 'A.5.1', '1.1'
    section TEXT,
    title TEXT NOT NULL,
    official_description TEXT NOT NULL,
    implementation_guidance TEXT,
    audit_ready_guidance TEXT, -- Our custom guidance
    applicable_groups TEXT[], -- For CIS: ['IG1','IG2','IG3']
    priority requirement_priority DEFAULT 'medium',
    tags TEXT[],
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id),
    updated_by UUID REFERENCES platform_administrators(id),
    UNIQUE(standard_id, requirement_code)
);

-- Track AuditReady guidance updates separately for version control
CREATE TABLE audit_ready_guidance_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID REFERENCES requirements_library(id) ON DELETE CASCADE,
    guidance_text TEXT NOT NULL,
    version_number INTEGER DEFAULT 1,
    change_reason TEXT,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id)
);

-- Standards update management
CREATE TABLE standard_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_id UUID REFERENCES standards_library(id) ON DELETE CASCADE,
    update_type TEXT NOT NULL, -- 'official_revision', 'guidance_update', 'correction'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'applied', 'rejected'
    proposed_changes JSONB,
    impact_assessment TEXT,
    affected_organizations_count INTEGER DEFAULT 0,
    approved_by UUID REFERENCES platform_administrators(id),
    applied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id)
);

-- ============================================================================
-- ORGANIZATION MANAGEMENT (MULTI-TENANT)
-- ============================================================================

-- Customer organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subscription_tier organization_tier DEFAULT 'free',
    billing_email TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    trial_ends_at TIMESTAMP,
    subscription_starts_at TIMESTAMP,
    subscription_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id)
);

-- Organization users (customers)
CREATE TABLE organization_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID, -- Can be platform admin or org admin
    UNIQUE(organization_id, email)
);

-- Organization subscriptions to standards
CREATE TABLE organization_standards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    standard_id UUID REFERENCES standards_library(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP DEFAULT NOW(),
    subscribed_by UUID REFERENCES organization_users(id),
    UNIQUE(organization_id, standard_id)
);

-- ============================================================================
-- COMPLIANCE AND ASSESSMENT DATA
-- ============================================================================

-- Compliance assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    standard_ids UUID[], -- Multiple standards per assessment
    status assessment_status DEFAULT 'draft',
    progress INTEGER DEFAULT 0, -- Percentage 0-100
    start_date DATE,
    target_completion_date DATE,
    completed_date DATE,
    assessor_id UUID REFERENCES organization_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Assessment requirement responses
CREATE TABLE assessment_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES requirements_library(id) ON DELETE CASCADE,
    status requirement_status DEFAULT 'not-fulfilled',
    evidence TEXT,
    notes TEXT,
    responsible_party TEXT,
    due_date DATE,
    completed_date DATE,
    last_reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES organization_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(assessment_id, requirement_id)
);

-- Evidence attachments
CREATE TABLE compliance_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    assessment_requirement_id UUID REFERENCES assessment_requirements(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID REFERENCES organization_users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATIONS AND COMMUNICATIONS
-- ============================================================================

-- System notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES organization_users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type notification_type NOT NULL,
    priority notification_priority DEFAULT 'medium',
    entity_id UUID, -- Related entity (requirement, assessment, etc.)
    due_date DATE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Standards library indexes
CREATE INDEX idx_standards_library_slug ON standards_library(slug);
CREATE INDEX idx_standards_library_active ON standards_library(is_active);
CREATE INDEX idx_requirements_library_standard ON requirements_library(standard_id);
CREATE INDEX idx_requirements_library_code ON requirements_library(requirement_code);

-- Organization indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(is_active);
CREATE INDEX idx_organization_users_org ON organization_users(organization_id);
CREATE INDEX idx_organization_users_email ON organization_users(email);

-- Assessment indexes
CREATE INDEX idx_assessments_org ON assessments(organization_id);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessment_requirements_assessment ON assessment_requirements(assessment_id);
CREATE INDEX idx_assessment_requirements_requirement ON assessment_requirements(requirement_id);

-- Notification indexes
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = false;

-- Audit log indexes
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, actor_type);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all organization-scoped tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on platform tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Platform administrators can access everything (bypass RLS)
CREATE POLICY "Platform admins bypass RLS" ON organizations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Organization users can only access their organization's data
CREATE POLICY "Organization users access own org" ON organizations
    FOR ALL TO authenticated
    USING (
        id IN (
            SELECT organization_id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Apply similar policies to other organization-scoped tables
CREATE POLICY "Organization users access own org users" ON organization_users
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
        OR EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Organization users access own assessments" ON assessments
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
        OR EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Standards library is read-only for organization users, full access for platform admins
ALTER TABLE standards_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Standards library read access" ON standards_library
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Standards library admin access" ON standards_library
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Requirements library read access" ON requirements_library
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Requirements library admin access" ON requirements_library
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- System settings policies
CREATE POLICY "System settings read access" ON system_settings
    FOR SELECT TO authenticated
    USING (NOT is_sensitive OR EXISTS (
        SELECT 1 FROM platform_administrators 
        WHERE email = auth.email() AND is_active = true
    ));

CREATE POLICY "System settings admin access" ON system_settings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Audit logs policies (read-only for everyone, write for system)
CREATE POLICY "Audit logs read access" ON audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to relevant tables
CREATE TRIGGER update_standards_library_updated_at 
    BEFORE UPDATE ON standards_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_library_updated_at 
    BEFORE UPDATE ON requirements_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_users_updated_at 
    BEFORE UPDATE ON organization_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at 
    BEFORE UPDATE ON assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_requirements_updated_at 
    BEFORE UPDATE ON assessment_requirements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA FOR PLATFORM ADMINISTRATORS
-- ============================================================================

-- Insert initial platform administrator (you as developer)
INSERT INTO platform_administrators (email, name, role) VALUES 
('admin@auditready.com', 'Platform Administrator', 'platform_admin'),
('Payam.Razifar@gmail.com', 'Payam Razifar', 'platform_admin');

-- Insert basic platform settings
INSERT INTO platform_settings (key, value, description, category) VALUES 
('platform_name', '"AuditReady"', 'Platform display name', 'branding'),
('max_organizations_per_admin', '1000', 'Maximum organizations per platform admin', 'limits'),
('default_organization_tier', '"free"', 'Default tier for new organizations', 'defaults'),
('enable_demo_mode', 'true', 'Enable demo mode for new users', 'features');

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE platform_administrators IS 'Platform-level administrators (developers/operators)';
COMMENT ON TABLE organizations IS 'Customer organizations (multi-tenant)';
COMMENT ON TABLE organization_users IS 'Users within customer organizations';
COMMENT ON TABLE standards_library IS 'Central repository of compliance standards';
COMMENT ON TABLE requirements_library IS 'Individual requirements/controls within standards';
COMMENT ON TABLE audit_ready_guidance_versions IS 'Version control for custom AuditReady guidance';
COMMENT ON TABLE assessments IS 'Compliance assessments created by organizations';
COMMENT ON TABLE assessment_requirements IS 'Organization responses to specific requirements';