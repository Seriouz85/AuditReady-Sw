-- ============================================================================
-- Enhanced Core Entities Schema - Phase 5 Data Persistence & Multi-tenancy
-- Building on 001_initial_schema.sql with additional production features
-- ============================================================================

-- ============================================================================
-- ENHANCED ENUMS AND TYPES
-- ============================================================================

CREATE TYPE document_type AS ENUM ('policy', 'procedure', 'evidence', 'report', 'template', 'manual');
CREATE TYPE document_status AS ENUM ('draft', 'under_review', 'approved', 'archived', 'rejected');
CREATE TYPE gap_analysis_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'suppressed');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical', 'emergency');
CREATE TYPE learning_status AS ENUM ('not_started', 'in_progress', 'completed', 'expired');
CREATE TYPE content_type AS ENUM ('video', 'document', 'quiz', 'simulation', 'interactive');

-- ============================================================================
-- DOCUMENT MANAGEMENT SYSTEM
-- ============================================================================

-- Enhanced document library with version control
CREATE TABLE document_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES document_library(id) ON DELETE CASCADE, -- For folder structure
    name TEXT NOT NULL,
    description TEXT,
    type document_type NOT NULL,
    status document_status DEFAULT 'draft',
    file_path TEXT, -- Storage path in Supabase Storage
    file_size BIGINT,
    mime_type TEXT,
    version_number INTEGER DEFAULT 1,
    is_current_version BOOLEAN DEFAULT true,
    is_template BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    metadata JSONB DEFAULT '{}',
    access_level TEXT DEFAULT 'organization', -- 'public', 'organization', 'restricted'
    allowed_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id),
    updated_by UUID REFERENCES organization_users(id),
    approved_by UUID REFERENCES organization_users(id),
    approved_at TIMESTAMP
);

-- Document version history
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES document_library(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    change_summary TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id),
    UNIQUE(document_id, version_number)
);

-- Document review and approval workflow
CREATE TABLE document_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES document_library(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES organization_users(id),
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    comments TEXT,
    reviewed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Link documents to requirements
CREATE TABLE requirement_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_id UUID REFERENCES requirements_library(id) ON DELETE CASCADE,
    document_id UUID REFERENCES document_library(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    relationship_type TEXT DEFAULT 'evidence', -- 'evidence', 'policy', 'procedure', 'template'
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id),
    UNIQUE(requirement_id, document_id, organization_id)
);

-- ============================================================================
-- ADVANCED ASSESSMENT SYSTEM
-- ============================================================================

-- Assessment templates for standardized assessments
CREATE TABLE assessment_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    standard_ids UUID[] NOT NULL,
    template_data JSONB NOT NULL, -- Assessment structure and default values
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Enhanced assessment tracking with workflow
CREATE TABLE assessment_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    stage TEXT NOT NULL, -- 'preparation', 'execution', 'review', 'approval', 'reporting'
    status TEXT NOT NULL, -- 'pending', 'in_progress', 'completed', 'blocked'
    assignee_id UUID REFERENCES organization_users(id),
    due_date DATE,
    completed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment collaboration and comments
CREATE TABLE assessment_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES requirements_library(id),
    parent_comment_id UUID REFERENCES assessment_comments(id),
    author_id UUID REFERENCES organization_users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment findings and remediation tracking
CREATE TABLE assessment_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES requirements_library(id),
    finding_type TEXT CHECK (finding_type IN ('gap', 'weakness', 'non_compliance', 'improvement')),
    severity requirement_priority DEFAULT 'medium',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    impact_assessment TEXT,
    remediation_plan TEXT,
    remediation_owner_id UUID REFERENCES organization_users(id),
    target_resolution_date DATE,
    actual_resolution_date DATE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted_risk')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- ============================================================================
-- GAP ANALYSIS AND RECOMMENDATIONS
-- ============================================================================

-- Gap analysis results
CREATE TABLE gap_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id),
    analysis_date DATE DEFAULT CURRENT_DATE,
    scope JSONB NOT NULL, -- Standards, departments, timeframe analyzed
    methodology TEXT,
    overall_maturity_score INTEGER CHECK (overall_maturity_score BETWEEN 0 AND 100),
    results JSONB NOT NULL, -- Detailed analysis results
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Individual gap items
CREATE TABLE gap_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gap_analysis_id UUID REFERENCES gap_analysis(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES requirements_library(id),
    gap_type TEXT NOT NULL, -- 'missing_control', 'inadequate_implementation', 'documentation_gap'
    severity gap_analysis_severity NOT NULL,
    current_state TEXT,
    target_state TEXT,
    effort_estimate TEXT, -- 'low', 'medium', 'high', 'very_high'
    business_impact TEXT,
    technical_complexity TEXT,
    priority_score INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI-powered recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    gap_item_id UUID REFERENCES gap_items(id),
    recommendation_type TEXT NOT NULL, -- 'quick_win', 'strategic', 'foundational'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    implementation_steps JSONB,
    estimated_effort TEXT,
    expected_impact TEXT,
    prerequisites TEXT[],
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    is_implemented BOOLEAN DEFAULT false,
    implemented_at TIMESTAMP,
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_comments TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by TEXT DEFAULT 'system' -- 'system' for AI-generated, user ID for manual
);

-- ============================================================================
-- COMPLIANCE MONITORING AND ALERTING
-- ============================================================================

-- Compliance monitoring rules
CREATE TABLE monitoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rule_type TEXT NOT NULL, -- 'schedule_based', 'threshold_based', 'event_based'
    conditions JSONB NOT NULL, -- Rule conditions and parameters
    scope JSONB NOT NULL, -- What to monitor (requirements, assessments, etc.)
    is_active BOOLEAN DEFAULT true,
    severity alert_severity DEFAULT 'warning',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Compliance alerts generated by monitoring rules
CREATE TABLE compliance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    monitoring_rule_id UUID REFERENCES monitoring_rules(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity alert_severity NOT NULL,
    status alert_status DEFAULT 'active',
    entity_type TEXT, -- 'requirement', 'assessment', 'document'
    entity_id UUID,
    due_date DATE,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES organization_users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert acknowledgments and escalations
CREATE TABLE alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES compliance_alerts(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'created', 'acknowledged', 'escalated', 'resolved', 'suppressed'
    actor_id UUID REFERENCES organization_users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- LEARNING MANAGEMENT SYSTEM (LMS)
-- ============================================================================

-- Learning content library
CREATE TABLE learning_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_type content_type NOT NULL,
    content_url TEXT, -- URL to video, document, or interactive content
    content_data JSONB, -- For quiz questions, simulation data, etc.
    duration_minutes INTEGER,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    prerequisites UUID[], -- Array of content IDs that should be completed first
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_mandatory BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Learning paths (courses)
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    content_ids UUID[] NOT NULL, -- Ordered array of learning_content IDs
    estimated_duration_hours INTEGER,
    is_mandatory BOOLEAN DEFAULT false,
    completion_criteria JSONB DEFAULT '{}', -- Requirements for completion
    certification_available BOOLEAN DEFAULT false,
    certificate_template_id UUID,
    valid_for_months INTEGER, -- How long certification is valid
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- User learning progress tracking
CREATE TABLE user_learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES organization_users(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id),
    content_id UUID REFERENCES learning_content(id),
    status learning_status DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    time_spent_minutes INTEGER DEFAULT 0,
    score DECIMAL(5,2), -- For quizzes and assessments
    passing_score DECIMAL(5,2),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, content_id)
);

-- Training assignments
CREATE TABLE training_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id),
    assigned_to_user_id UUID REFERENCES organization_users(id),
    assigned_by_user_id UUID REFERENCES organization_users(id),
    due_date DATE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    completion_required BOOLEAN DEFAULT false,
    reminder_settings JSONB DEFAULT '{}',
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue', 'cancelled')),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(learning_path_id, assigned_to_user_id)
);

-- ============================================================================
-- REAL-TIME COLLABORATION
-- ============================================================================

-- User presence for real-time collaboration
CREATE TABLE user_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES organization_users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'requirement', 'assessment', 'document'
    entity_id UUID NOT NULL,
    status TEXT DEFAULT 'viewing' CHECK (status IN ('viewing', 'editing', 'idle')),
    last_seen TIMESTAMP DEFAULT NOW(),
    session_id TEXT,
    metadata JSONB DEFAULT '{}', -- Additional context like cursor position
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, entity_type, entity_id)
);

-- Real-time activity feed
CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES organization_users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_name TEXT,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    is_system_generated BOOLEAN DEFAULT false,
    visibility TEXT DEFAULT 'organization' CHECK (visibility IN ('public', 'organization', 'team', 'private')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Change tracking for audit trail
CREATE TABLE change_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES organization_users(id),
    changed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- ============================================================================
-- ADVANCED INDEXES FOR PERFORMANCE
-- ============================================================================

-- Document library indexes
CREATE INDEX idx_document_library_org_id ON document_library(organization_id);
CREATE INDEX idx_document_library_type ON document_library(type);
CREATE INDEX idx_document_library_status ON document_library(status);
CREATE INDEX idx_document_library_parent ON document_library(parent_id);
CREATE INDEX idx_document_library_tags ON document_library USING GIN(tags);
CREATE INDEX idx_document_versions_doc_id ON document_versions(document_id);

-- Assessment system indexes
CREATE INDEX idx_assessment_templates_org_id ON assessment_templates(organization_id);
CREATE INDEX idx_assessment_workflow_assessment_id ON assessment_workflow(assessment_id);
CREATE INDEX idx_assessment_comments_assessment_id ON assessment_comments(assessment_id);
CREATE INDEX idx_assessment_findings_assessment_id ON assessment_findings(assessment_id);
CREATE INDEX idx_assessment_findings_status ON assessment_findings(status);

-- Gap analysis indexes
CREATE INDEX idx_gap_analysis_org_id ON gap_analysis(organization_id);
CREATE INDEX idx_gap_analysis_assessment_id ON gap_analysis(assessment_id);
CREATE INDEX idx_gap_items_analysis_id ON gap_items(gap_analysis_id);
CREATE INDEX idx_gap_items_severity ON gap_items(severity);
CREATE INDEX idx_recommendations_org_id ON recommendations(organization_id);
CREATE INDEX idx_recommendations_gap_item_id ON recommendations(gap_item_id);

-- Monitoring and alerts indexes
CREATE INDEX idx_monitoring_rules_org_id ON monitoring_rules(organization_id);
CREATE INDEX idx_monitoring_rules_active ON monitoring_rules(is_active);
CREATE INDEX idx_compliance_alerts_org_id ON compliance_alerts(organization_id);
CREATE INDEX idx_compliance_alerts_status ON compliance_alerts(status);
CREATE INDEX idx_compliance_alerts_severity ON compliance_alerts(severity);
CREATE INDEX idx_alert_history_alert_id ON alert_history(alert_id);

-- LMS indexes
CREATE INDEX idx_learning_content_org_id ON learning_content(organization_id);
CREATE INDEX idx_learning_content_type ON learning_content(content_type);
CREATE INDEX idx_learning_content_tags ON learning_content USING GIN(tags);
CREATE INDEX idx_learning_paths_org_id ON learning_paths(organization_id);
CREATE INDEX idx_user_learning_progress_user_id ON user_learning_progress(user_id);
CREATE INDEX idx_user_learning_progress_status ON user_learning_progress(status);
CREATE INDEX idx_training_assignments_org_id ON training_assignments(organization_id);
CREATE INDEX idx_training_assignments_user_id ON training_assignments(assigned_to_user_id);

-- Real-time collaboration indexes
CREATE INDEX idx_user_presence_user_id ON user_presence(user_id);
CREATE INDEX idx_user_presence_entity ON user_presence(entity_type, entity_id);
CREATE INDEX idx_activity_feed_org_id ON activity_feed(organization_id);
CREATE INDEX idx_activity_feed_actor_id ON activity_feed(actor_id);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX idx_change_log_org_id ON change_log(organization_id);
CREATE INDEX idx_change_log_table_record ON change_log(table_name, record_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE document_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_log ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for organization isolation
CREATE POLICY "Organization members access own documents" ON document_library
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

CREATE POLICY "Organization members access own assessments data" ON assessment_templates
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

CREATE POLICY "Organization members access own gap analysis" ON gap_analysis
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

CREATE POLICY "Organization members access own monitoring" ON monitoring_rules
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

CREATE POLICY "Organization members access own learning content" ON learning_content
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

-- User can only see their own learning progress
CREATE POLICY "Users access own learning progress" ON user_learning_progress
    FOR ALL TO authenticated
    USING (
        user_id IN (
            SELECT id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
        OR user_id IN (
            SELECT ou.id FROM organization_users ou
            JOIN organization_users ou2 ON ou.organization_id = ou2.organization_id
            WHERE ou2.email = auth.email() AND ou2.is_active = true
            AND ou2.role IN ('organization_admin', 'compliance_manager')
        )
        OR EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_document_library_updated_at 
    BEFORE UPDATE ON document_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_templates_updated_at 
    BEFORE UPDATE ON assessment_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_workflow_updated_at 
    BEFORE UPDATE ON assessment_workflow 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_comments_updated_at 
    BEFORE UPDATE ON assessment_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_findings_updated_at 
    BEFORE UPDATE ON assessment_findings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_rules_updated_at 
    BEFORE UPDATE ON monitoring_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_alerts_updated_at 
    BEFORE UPDATE ON compliance_alerts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_content_updated_at 
    BEFORE UPDATE ON learning_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at 
    BEFORE UPDATE ON learning_paths 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ADVANCED FUNCTIONS AND STORED PROCEDURES
-- ============================================================================

-- Function to calculate compliance score for an organization
CREATE OR REPLACE FUNCTION calculate_compliance_score(org_id UUID, standard_id UUID DEFAULT NULL)
RETURNS TABLE(
    total_requirements INTEGER,
    fulfilled_requirements INTEGER,
    compliance_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(ar.id)::INTEGER as total_requirements,
        COUNT(CASE WHEN ar.status = 'fulfilled' THEN 1 END)::INTEGER as fulfilled_requirements,
        ROUND(
            (COUNT(CASE WHEN ar.status = 'fulfilled' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(ar.id)::DECIMAL, 0)) * 100, 
            2
        ) as compliance_percentage
    FROM assessment_requirements ar
    JOIN assessments a ON ar.assessment_id = a.id
    JOIN requirements_library rl ON ar.requirement_id = rl.id
    WHERE a.organization_id = org_id
    AND (standard_id IS NULL OR rl.standard_id = standard_id)
    AND a.status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate activity feed entries automatically
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
    actor_id UUID;
    action_text TEXT;
    entity_name_text TEXT;
BEGIN
    -- Get organization ID from the record
    IF TG_TABLE_NAME = 'assessment_requirements' THEN
        SELECT a.organization_id INTO org_id 
        FROM assessments a 
        WHERE a.id = COALESCE(NEW.assessment_id, OLD.assessment_id);
    ELSIF TG_TABLE_NAME = 'document_library' THEN
        org_id := COALESCE(NEW.organization_id, OLD.organization_id);
    END IF;

    -- Get actor ID (user performing the action)
    actor_id := COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by);

    -- Generate action description
    IF TG_OP = 'INSERT' THEN
        action_text := 'created';
        entity_name_text := NEW.name;
    ELSIF TG_OP = 'UPDATE' THEN
        action_text := 'updated';
        entity_name_text := NEW.name;
    ELSIF TG_OP = 'DELETE' THEN
        action_text := 'deleted';
        entity_name_text := OLD.name;
    END IF;

    -- Insert activity record
    INSERT INTO activity_feed (
        organization_id,
        actor_id,
        action,
        entity_type,
        entity_id,
        entity_name,
        description,
        is_system_generated
    ) VALUES (
        org_id,
        actor_id,
        action_text,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        entity_name_text,
        format('User %s %s %s', 
            COALESCE(actor_id::TEXT, 'system'), 
            action_text, 
            TG_TABLE_NAME
        ),
        false
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging triggers to key tables
CREATE TRIGGER activity_log_document_library
    AFTER INSERT OR UPDATE OR DELETE ON document_library
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER activity_log_assessment_requirements
    AFTER INSERT OR UPDATE OR DELETE ON assessment_requirements
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE document_library IS 'Enhanced document management with version control and approval workflows';
COMMENT ON TABLE document_versions IS 'Version history tracking for all documents';
COMMENT ON TABLE assessment_templates IS 'Reusable assessment templates for standardized evaluations';
COMMENT ON TABLE assessment_workflow IS 'Multi-stage assessment workflow management';
COMMENT ON TABLE gap_analysis IS 'Comprehensive gap analysis results and recommendations';
COMMENT ON TABLE monitoring_rules IS 'Automated compliance monitoring and alerting rules';
COMMENT ON TABLE learning_content IS 'LMS content library for training and education';
COMMENT ON TABLE user_learning_progress IS 'Individual user progress tracking for learning content';
COMMENT ON TABLE user_presence IS 'Real-time user presence for collaborative editing';
COMMENT ON TABLE activity_feed IS 'Organization-wide activity feed for transparency';
COMMENT ON TABLE change_log IS 'Comprehensive audit trail for all data changes';

-- Insert sample monitoring rules for new organizations
INSERT INTO platform_settings (key, value, description, category) VALUES 
('default_monitoring_rules', '["overdue_requirements", "expiring_certifications", "incomplete_assessments"]', 'Default monitoring rules for new organizations', 'compliance'),
('compliance_score_thresholds', '{"warning": 70, "critical": 50}', 'Compliance score thresholds for alerting', 'compliance'),
('learning_reminder_schedule', '{"initial_days": 7, "reminder_days": [3, 1]}', 'Default learning assignment reminder schedule', 'learning');