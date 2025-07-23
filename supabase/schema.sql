--
-- Clean Database Schema for Audit Readiness Hub
-- Production-ready schema with all features included
--

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

--
-- Core Tables
--

-- Organizations (Multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'business',
    size TEXT DEFAULT 'medium',
    industry TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    organization_id UUID REFERENCES organizations(id),
    role TEXT DEFAULT 'user',
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standards Library
CREATE TABLE standards_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    version TEXT,
    description TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requirements Library
CREATE TABLE requirements_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    standard_id UUID REFERENCES standards_library(id),
    control_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    implementation_guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Compliance Categories (22 categories)
CREATE TABLE unified_compliance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Requirements
CREATE TABLE unified_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES unified_compliance_categories(id),
    title TEXT NOT NULL,
    description TEXT,
    implementation_guidance TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Requirement Mappings
CREATE TABLE unified_requirement_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID REFERENCES requirements_library(id),
    unified_requirement_id UUID REFERENCES unified_requirements(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(requirement_id, unified_requirement_id)
);

-- Organization Requirements
CREATE TABLE organization_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    requirement_id UUID REFERENCES requirements_library(id),
    status TEXT DEFAULT 'not_fulfilled',
    implementation_notes TEXT,
    evidence_links TEXT[],
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MFA System Tables
CREATE TABLE mfa_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    device_name TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    backup_codes TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mfa_verification_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    operation_type TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Classification System
CREATE TABLE organization_data_classification_labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    label_name TEXT NOT NULL,
    classification_level TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_sensitive_data_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    data_source TEXT NOT NULL,
    detection_type TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    location_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backup System
CREATE TABLE organization_backups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    backup_type TEXT NOT NULL,
    status TEXT DEFAULT 'in_progress',
    backup_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sensitive Operations Log
CREATE TABLE sensitive_operations_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    operation_type TEXT NOT NULL,
    operation_data JSONB,
    mfa_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--
-- RLS Policies (Row Level Security)
--

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE mfa_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Sample RLS policies (simplified)
CREATE POLICY "Users can see own organization" ON organizations FOR ALL USING (id = (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can see own data" ON users FOR ALL USING (id = auth.uid() OR organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()));

--
-- Indexes for Performance
--

CREATE INDEX idx_org_requirements_org_id ON organization_requirements(organization_id);
CREATE INDEX idx_org_requirements_req_id ON organization_requirements(requirement_id);
CREATE INDEX idx_org_requirements_status ON organization_requirements(status);
CREATE INDEX idx_requirements_standard_id ON requirements_library(standard_id);
CREATE INDEX idx_unified_mappings_req_id ON unified_requirement_mappings(requirement_id);
CREATE INDEX idx_unified_mappings_unified_id ON unified_requirement_mappings(unified_requirement_id);

--
-- Functions and Triggers
--

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organization_requirements_updated_at BEFORE UPDATE ON organization_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Schema complete: Production-ready Audit Readiness Hub database
