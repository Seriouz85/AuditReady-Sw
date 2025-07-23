-- ============================================================================
-- Security and Advanced Compliance Features
-- Enhanced security controls, audit trails, and compliance automation
-- ============================================================================

-- ============================================================================
-- SECURITY AND ACCESS CONTROL
-- ============================================================================

-- IP access control for organizations
CREATE TABLE ip_access_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rule_type TEXT CHECK (rule_type IN ('allow', 'deny')) DEFAULT 'allow',
    ip_ranges TEXT[] NOT NULL, -- CIDR notation IP ranges
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Session management and security
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES organization_users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    location_info JSONB, -- Geo-location data
    device_fingerprint TEXT,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Security events and intrusion detection
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES organization_users(id),
    event_type TEXT NOT NULL, -- 'login_failure', 'suspicious_activity', 'data_access', 'privilege_escalation'
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    source_ip INET,
    user_agent TEXT,
    event_details JSONB NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES organization_users(id),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Data classification and sensitivity labels
CREATE TABLE data_classifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sensitivity_level INTEGER CHECK (sensitivity_level BETWEEN 1 AND 5), -- 1=Public, 5=Top Secret
    handling_requirements JSONB, -- Encryption, retention, access controls
    color_code TEXT, -- For UI display
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id),
    UNIQUE(organization_id, name)
);

-- Apply data classifications to records
CREATE TABLE data_classification_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classification_id UUID REFERENCES data_classifications(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    field_names TEXT[], -- Specific fields that are classified
    applied_by UUID REFERENCES organization_users(id),
    applied_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- Auto-declassification date
    UNIQUE(table_name, record_id, classification_id)
);

-- ============================================================================
-- ADVANCED AUDIT AND COMPLIANCE TRACKING
-- ============================================================================

-- Compliance frameworks mapping (many-to-many relationships)
CREATE TABLE framework_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_requirement_id UUID REFERENCES requirements_library(id) ON DELETE CASCADE,
    target_requirement_id UUID REFERENCES requirements_library(id) ON DELETE CASCADE,
    mapping_type TEXT CHECK (mapping_type IN ('equivalent', 'related', 'supersedes', 'subset_of')),
    confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id),
    UNIQUE(source_requirement_id, target_requirement_id)
);

-- Compliance history tracking for point-in-time reporting
CREATE TABLE compliance_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    standard_id UUID REFERENCES standards_library(id),
    total_requirements INTEGER NOT NULL,
    fulfilled_count INTEGER NOT NULL,
    partially_fulfilled_count INTEGER NOT NULL,
    not_fulfilled_count INTEGER NOT NULL,
    not_applicable_count INTEGER NOT NULL,
    compliance_percentage DECIMAL(5,2) NOT NULL,
    maturity_level INTEGER CHECK (maturity_level BETWEEN 1 AND 5),
    snapshot_data JSONB, -- Detailed snapshot for reconstruction
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(organization_id, snapshot_date, standard_id)
);

-- Evidence collection and validation
CREATE TABLE evidence_validation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id UUID REFERENCES compliance_evidence(id) ON DELETE CASCADE,
    validator_id UUID REFERENCES organization_users(id),
    validation_status TEXT CHECK (validation_status IN ('pending', 'approved', 'rejected', 'needs_clarification')),
    validation_criteria JSONB, -- What was checked
    findings TEXT,
    validation_date TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- When validation expires
    created_at TIMESTAMP DEFAULT NOW()
);

-- Risk assessment and management
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    risk_category TEXT, -- 'operational', 'financial', 'strategic', 'compliance'
    probability INTEGER CHECK (probability BETWEEN 1 AND 5), -- 1=Very Low, 5=Very High
    impact INTEGER CHECK (impact BETWEEN 1 AND 5), -- 1=Negligible, 5=Catastrophic
    risk_score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
    current_controls TEXT,
    residual_risk_score INTEGER,
    treatment_plan TEXT,
    owner_id UUID REFERENCES organization_users(id),
    review_date DATE,
    status TEXT CHECK (status IN ('identified', 'assessed', 'treated', 'monitored', 'closed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Risk mitigation actions
CREATE TABLE risk_mitigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_assessment_id UUID REFERENCES risk_assessments(id) ON DELETE CASCADE,
    action_description TEXT NOT NULL,
    action_type TEXT CHECK (action_type IN ('avoid', 'mitigate', 'transfer', 'accept')),
    responsible_party_id UUID REFERENCES organization_users(id),
    target_completion_date DATE,
    actual_completion_date DATE,
    status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    cost_estimate DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- AUTOMATED COMPLIANCE TESTING
-- ============================================================================

-- Automated compliance tests/checks
CREATE TABLE compliance_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES requirements_library(id),
    name TEXT NOT NULL,
    description TEXT,
    test_type TEXT CHECK (test_type IN ('technical', 'policy', 'process', 'documentation')),
    test_script JSONB, -- Test configuration or script
    expected_result JSONB,
    frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually', 'on_demand')),
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Test execution results
CREATE TABLE compliance_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID REFERENCES compliance_tests(id) ON DELETE CASCADE,
    execution_date TIMESTAMP DEFAULT NOW(),
    status TEXT CHECK (status IN ('pass', 'fail', 'warning', 'error', 'skipped')),
    actual_result JSONB,
    deviation_notes TEXT,
    remediation_required BOOLEAN DEFAULT false,
    remediation_actions TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- VENDOR AND THIRD-PARTY MANAGEMENT
-- ============================================================================

-- Vendor/supplier management
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    business_type TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address JSONB,
    website TEXT,
    risk_tier TEXT CHECK (risk_tier IN ('low', 'medium', 'high', 'critical')),
    onboarding_date DATE,
    contract_start_date DATE,
    contract_end_date DATE,
    compliance_requirements TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES organization_users(id)
);

-- Vendor assessments and due diligence
CREATE TABLE vendor_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    assessment_type TEXT CHECK (assessment_type IN ('initial', 'periodic', 'incident_response', 'contract_renewal')),
    assessor_id UUID REFERENCES organization_users(id),
    assessment_date DATE,
    scope TEXT,
    findings JSONB,
    overall_rating TEXT CHECK (overall_rating IN ('excellent', 'good', 'acceptable', 'needs_improvement', 'unacceptable')),
    recommendations TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INCIDENT MANAGEMENT
-- ============================================================================

-- Security and compliance incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    incident_number TEXT UNIQUE NOT NULL, -- Auto-generated incident ID
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    incident_type TEXT CHECK (incident_type IN ('security', 'privacy', 'compliance', 'operational')),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    status TEXT CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'closed')) DEFAULT 'open',
    reported_by UUID REFERENCES organization_users(id),
    assigned_to UUID REFERENCES organization_users(id),
    discovered_at TIMESTAMP,
    reported_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    impact_assessment TEXT,
    root_cause TEXT,
    lessons_learned TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Incident response timeline and actions
CREATE TABLE incident_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
    action_type TEXT CHECK (action_type IN ('investigation', 'containment', 'eradication', 'recovery', 'communication')),
    description TEXT NOT NULL,
    taken_by UUID REFERENCES organization_users(id),
    completed_at TIMESTAMP DEFAULT NOW(),
    outcome TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Security and access control indexes
CREATE INDEX idx_ip_access_rules_org_id ON ip_access_rules(organization_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_security_events_org_id ON security_events(organization_id);
CREATE INDEX idx_security_events_type_severity ON security_events(event_type, severity);
CREATE INDEX idx_data_classifications_org_id ON data_classifications(organization_id);
CREATE INDEX idx_data_classification_assignments_record ON data_classification_assignments(table_name, record_id);

-- Compliance tracking indexes
CREATE INDEX idx_framework_mappings_source ON framework_mappings(source_requirement_id);
CREATE INDEX idx_framework_mappings_target ON framework_mappings(target_requirement_id);
CREATE INDEX idx_compliance_snapshots_org_date ON compliance_snapshots(organization_id, snapshot_date);
CREATE INDEX idx_evidence_validation_evidence_id ON evidence_validation(evidence_id);
CREATE INDEX idx_risk_assessments_org_id ON risk_assessments(organization_id);
CREATE INDEX idx_risk_assessments_score ON risk_assessments(risk_score DESC);

-- Testing and vendor indexes
CREATE INDEX idx_compliance_tests_org_id ON compliance_tests(organization_id);
CREATE INDEX idx_compliance_tests_next_run ON compliance_tests(next_run_at) WHERE is_active = true;
CREATE INDEX idx_compliance_test_results_test_id ON compliance_test_results(test_id);
CREATE INDEX idx_vendors_org_id ON vendors(organization_id);
CREATE INDEX idx_vendor_assessments_vendor_id ON vendor_assessments(vendor_id);

-- Incident management indexes
CREATE INDEX idx_incidents_org_id ON incidents(organization_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incident_actions_incident_id ON incident_actions(incident_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE ip_access_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_classification_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_mitigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_actions ENABLE ROW LEVEL SECURITY;

-- Framework mappings are read-only for organization users, full access for platform admins
ALTER TABLE framework_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Framework mappings read access" ON framework_mappings
    FOR SELECT TO authenticated
    USING (true); -- All authenticated users can read mappings

CREATE POLICY "Framework mappings admin access" ON framework_mappings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Standard organization-scoped policies for other tables
CREATE POLICY "Organization members access own security data" ON security_events
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

-- Users can only see their own sessions
CREATE POLICY "Users access own sessions" ON user_sessions
    FOR ALL TO authenticated
    USING (
        user_id IN (
            SELECT id FROM organization_users 
            WHERE email = auth.email() AND is_active = true
        )
        OR EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- ============================================================================
-- TRIGGERS FOR TIMESTAMP UPDATES
-- ============================================================================

CREATE TRIGGER update_ip_access_rules_updated_at 
    BEFORE UPDATE ON ip_access_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_classifications_updated_at 
    BEFORE UPDATE ON data_classifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_assessments_updated_at 
    BEFORE UPDATE ON risk_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_mitigations_updated_at 
    BEFORE UPDATE ON risk_mitigations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_tests_updated_at 
    BEFORE UPDATE ON compliance_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
    BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_assessments_updated_at 
    BEFORE UPDATE ON vendor_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at 
    BEFORE UPDATE ON incidents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ADVANCED FUNCTIONS
-- ============================================================================

-- Function to auto-generate incident numbers
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $$
DECLARE
    year_suffix TEXT;
    sequence_num INTEGER;
    incident_num TEXT;
BEGIN
    -- Get current year
    year_suffix := TO_CHAR(NOW(), 'YY');
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(incident_number FROM 'INC-' || year_suffix || '-(\d+)') 
            AS INTEGER
        )
    ), 0) + 1
    INTO sequence_num
    FROM incidents
    WHERE incident_number LIKE 'INC-' || year_suffix || '-%'
    AND organization_id = NEW.organization_id;
    
    -- Generate incident number
    incident_num := 'INC-' || year_suffix || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    NEW.incident_number := incident_num;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to auto-generate incident numbers
CREATE TRIGGER generate_incident_number_trigger
    BEFORE INSERT ON incidents
    FOR EACH ROW
    WHEN (NEW.incident_number IS NULL)
    EXECUTE FUNCTION generate_incident_number();

-- Function to create compliance snapshots
CREATE OR REPLACE FUNCTION create_compliance_snapshot(
    org_id UUID,
    standard_id_param UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Create snapshot for each standard (or specific standard if provided)
    FOR rec IN 
        SELECT DISTINCT rl.standard_id
        FROM assessment_requirements ar
        JOIN assessments a ON ar.assessment_id = a.id
        JOIN requirements_library rl ON ar.requirement_id = rl.id
        WHERE a.organization_id = org_id
        AND a.status = 'completed'
        AND (standard_id_param IS NULL OR rl.standard_id = standard_id_param)
    LOOP
        INSERT INTO compliance_snapshots (
            organization_id,
            snapshot_date,
            standard_id,
            total_requirements,
            fulfilled_count,
            partially_fulfilled_count,
            not_fulfilled_count,
            not_applicable_count,
            compliance_percentage
        )
        SELECT 
            org_id,
            CURRENT_DATE,
            rec.standard_id,
            COUNT(*),
            COUNT(CASE WHEN ar.status = 'fulfilled' THEN 1 END),
            COUNT(CASE WHEN ar.status = 'partially-fulfilled' THEN 1 END),
            COUNT(CASE WHEN ar.status = 'not-fulfilled' THEN 1 END),
            COUNT(CASE WHEN ar.status = 'not-applicable' THEN 1 END),
            ROUND(
                (COUNT(CASE WHEN ar.status = 'fulfilled' THEN 1 END)::DECIMAL / 
                 NULLIF(COUNT(*)::DECIMAL, 0)) * 100, 
                2
            )
        FROM assessment_requirements ar
        JOIN assessments a ON ar.assessment_id = a.id
        JOIN requirements_library rl ON ar.requirement_id = rl.id
        WHERE a.organization_id = org_id
        AND rl.standard_id = rec.standard_id
        AND a.status = 'completed'
        ON CONFLICT (organization_id, snapshot_date, standard_id) 
        DO UPDATE SET
            total_requirements = EXCLUDED.total_requirements,
            fulfilled_count = EXCLUDED.fulfilled_count,
            partially_fulfilled_count = EXCLUDED.partially_fulfilled_count,
            not_fulfilled_count = EXCLUDED.not_fulfilled_count,
            not_applicable_count = EXCLUDED.not_applicable_count,
            compliance_percentage = EXCLUDED.compliance_percentage;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE ip_access_rules IS 'IP-based access control rules for organizations';
COMMENT ON TABLE user_sessions IS 'Active user session tracking for security monitoring';
COMMENT ON TABLE security_events IS 'Security event logging and intrusion detection';
COMMENT ON TABLE data_classifications IS 'Data sensitivity classification system';
COMMENT ON TABLE framework_mappings IS 'Cross-framework requirement mappings';
COMMENT ON TABLE compliance_snapshots IS 'Point-in-time compliance status snapshots';
COMMENT ON TABLE risk_assessments IS 'Organizational risk assessment and management';
COMMENT ON TABLE compliance_tests IS 'Automated compliance testing and validation';
COMMENT ON TABLE vendors IS 'Third-party vendor and supplier management';
COMMENT ON TABLE incidents IS 'Security and compliance incident tracking';

-- Insert default data classifications
INSERT INTO platform_settings (key, value, description, category) VALUES 
('default_data_classifications', '[
    {"name": "Public", "level": 1, "color": "#10B981"},
    {"name": "Internal", "level": 2, "color": "#3B82F6"},
    {"name": "Confidential", "level": 3, "color": "#F59E0B"},
    {"name": "Restricted", "level": 4, "color": "#EF4444"},
    {"name": "Top Secret", "level": 5, "color": "#7C2D12"}
]', 'Default data classification levels', 'security'),
('incident_severity_sla', '{
    "low": {"response_hours": 72, "resolution_hours": 168},
    "medium": {"response_hours": 24, "resolution_hours": 72},
    "high": {"response_hours": 4, "resolution_hours": 24},
    "critical": {"response_hours": 1, "resolution_hours": 8}
}', 'SLA response times by incident severity', 'security');