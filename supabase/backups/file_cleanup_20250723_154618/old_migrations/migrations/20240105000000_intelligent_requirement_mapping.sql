-- ============================================================================
-- Intelligent Requirement Mapping System
-- Creates a sophisticated mapping structure for SaaS-ready compliance management
-- ============================================================================

-- Requirement similarity scores (for intelligent aggregation)
CREATE TABLE requirement_similarity_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_a_id UUID REFERENCES requirements_library(id) ON DELETE CASCADE,
    requirement_b_id UUID REFERENCES requirements_library(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) CHECK (similarity_score >= 0 AND similarity_score <= 1),
    similarity_type TEXT CHECK (similarity_type IN ('semantic', 'structural', 'objective', 'implementation')),
    ai_confidence DECIMAL(3,2),
    analysis_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(requirement_a_id, requirement_b_id, similarity_type)
);

-- Requirement clusters (groups of similar requirements across frameworks)
CREATE TABLE requirement_clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_name TEXT NOT NULL,
    cluster_description TEXT,
    primary_objective TEXT NOT NULL,
    implementation_approach TEXT,
    unified_category_id UUID REFERENCES unified_compliance_categories(id),
    cluster_strength DECIMAL(3,2) DEFAULT 0.80, -- How similar requirements in this cluster are
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cluster members (which requirements belong to which clusters)
CREATE TABLE requirement_cluster_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID REFERENCES requirement_clusters(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES requirements_library(id) ON DELETE CASCADE,
    membership_strength DECIMAL(3,2) DEFAULT 1.0, -- How well this requirement fits the cluster
    is_primary BOOLEAN DEFAULT false, -- Is this the primary/representative requirement
    mapping_rationale TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(cluster_id, requirement_id)
);

-- Framework control mappings (maps controls by their actual structure)
CREATE TABLE framework_control_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_framework TEXT NOT NULL,
    source_chapter TEXT, -- e.g., "Chapter 1" for CIS
    source_section TEXT, -- e.g., "1.1" for CIS
    target_category_id UUID REFERENCES unified_compliance_categories(id),
    mapping_confidence DECIMAL(3,2) DEFAULT 0.90,
    mapping_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(source_framework, source_chapter, source_section, target_category_id)
);

-- Aggregation rules (how to combine similar requirements)
CREATE TABLE aggregation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name TEXT NOT NULL UNIQUE,
    rule_type TEXT CHECK (rule_type IN ('merge', 'consolidate', 'reference', 'hierarchy')),
    condition_query TEXT, -- SQL or rule expression to identify applicable requirements
    aggregation_template TEXT, -- Template for creating aggregated requirement
    priority INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Aggregated requirements (the result of intelligent aggregation)
CREATE TABLE aggregated_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unified_requirement_id UUID REFERENCES unified_requirements(id),
    aggregation_rule_id UUID REFERENCES aggregation_rules(id),
    aggregated_title TEXT NOT NULL,
    aggregated_description TEXT NOT NULL,
    implementation_guidance TEXT,
    source_requirement_ids UUID[] NOT NULL, -- Array of requirement IDs that were aggregated
    aggregation_metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_similarity_scores_req_a ON requirement_similarity_scores(requirement_a_id);
CREATE INDEX idx_similarity_scores_req_b ON requirement_similarity_scores(requirement_b_id);
CREATE INDEX idx_similarity_scores_score ON requirement_similarity_scores(similarity_score DESC);
CREATE INDEX idx_cluster_members_cluster ON requirement_cluster_members(cluster_id);
CREATE INDEX idx_cluster_members_requirement ON requirement_cluster_members(requirement_id);
CREATE INDEX idx_control_mappings_source ON framework_control_mappings(source_framework, source_chapter);
CREATE INDEX idx_aggregated_requirements_unified ON aggregated_requirements(unified_requirement_id);

-- Enable RLS
ALTER TABLE requirement_similarity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirement_cluster_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_control_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregated_requirements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Read access for all authenticated users
CREATE POLICY "Read similarity scores" ON requirement_similarity_scores
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Read clusters" ON requirement_clusters
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Read cluster members" ON requirement_cluster_members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Read control mappings" ON framework_control_mappings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Read aggregation rules" ON aggregation_rules
    FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Read aggregated requirements" ON aggregated_requirements
    FOR SELECT TO authenticated USING (true);

-- Admin write policies
CREATE POLICY "Admin manage similarity scores" ON requirement_similarity_scores
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM platform_administrators WHERE email = auth.email() AND is_active = true));

CREATE POLICY "Admin manage clusters" ON requirement_clusters
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM platform_administrators WHERE email = auth.email() AND is_active = true));

CREATE POLICY "Admin manage cluster members" ON requirement_cluster_members
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM platform_administrators WHERE email = auth.email() AND is_active = true));

CREATE POLICY "Admin manage control mappings" ON framework_control_mappings
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM platform_administrators WHERE email = auth.email() AND is_active = true));

CREATE POLICY "Admin manage aggregation rules" ON aggregation_rules
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM platform_administrators WHERE email = auth.email() AND is_active = true));

CREATE POLICY "Admin manage aggregated requirements" ON aggregated_requirements
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM platform_administrators WHERE email = auth.email() AND is_active = true));

-- Triggers for timestamp updates
CREATE TRIGGER update_similarity_scores_updated_at 
    BEFORE UPDATE ON requirement_similarity_scores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clusters_updated_at 
    BEFORE UPDATE ON requirement_clusters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_control_mappings_updated_at 
    BEFORE UPDATE ON framework_control_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aggregation_rules_updated_at 
    BEFORE UPDATE ON aggregation_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aggregated_requirements_updated_at 
    BEFORE UPDATE ON aggregated_requirements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Initial Framework Control Mappings
-- Based on actual standard structures
-- ============================================================================

-- CIS Controls Chapter Mappings
INSERT INTO framework_control_mappings (source_framework, source_chapter, target_category_id, mapping_notes) VALUES
-- Chapter 1: Inventory and Control of Enterprise Assets
('CIS Controls', 'Chapter 1', (SELECT id FROM unified_compliance_categories WHERE name = 'Inventory and Control of Hardware Assets'), 'CIS Chapter 1 maps to hardware inventory'),
-- Chapter 2: Inventory and Control of Software Assets  
('CIS Controls', 'Chapter 2', (SELECT id FROM unified_compliance_categories WHERE name = 'Inventory and Control of Software Assets'), 'CIS Chapter 2 maps to software inventory'),
-- Chapter 3: Data Protection
('CIS Controls', 'Chapter 3', (SELECT id FROM unified_compliance_categories WHERE name = 'Data Protection'), 'CIS Chapter 3 maps to data protection'),
-- Chapter 4: Secure Configuration
('CIS Controls', 'Chapter 4', (SELECT id FROM unified_compliance_categories WHERE name = 'Secure Configuration'), 'CIS Chapter 4 maps to secure configuration'),
-- Chapter 5: Account Management
('CIS Controls', 'Chapter 5', (SELECT id FROM unified_compliance_categories WHERE name = 'Access Control'), 'CIS Chapter 5 maps to access control'),
-- Chapter 6: Access Control Management
('CIS Controls', 'Chapter 6', (SELECT id FROM unified_compliance_categories WHERE name = 'Access Control'), 'CIS Chapter 6 maps to access control'),
-- Chapter 7: Continuous Vulnerability Management
('CIS Controls', 'Chapter 7', (SELECT id FROM unified_compliance_categories WHERE name = 'Vulnerability Management'), 'CIS Chapter 7 maps to vulnerability management'),
-- Chapter 8: Audit Log Management
('CIS Controls', 'Chapter 8', (SELECT id FROM unified_compliance_categories WHERE name = 'Audit Logging'), 'CIS Chapter 8 maps to audit logging'),
-- Chapter 9: Email and Web Browser Protections
('CIS Controls', 'Chapter 9', (SELECT id FROM unified_compliance_categories WHERE name = 'Email & Web Security'), 'CIS Chapter 9 maps to email/web security'),
-- Chapter 10: Malware Defenses
('CIS Controls', 'Chapter 10', (SELECT id FROM unified_compliance_categories WHERE name = 'Malware Defense'), 'CIS Chapter 10 maps to malware defense'),
-- Chapter 11: Data Recovery
('CIS Controls', 'Chapter 11', (SELECT id FROM unified_compliance_categories WHERE name = 'Business Continuity'), 'CIS Chapter 11 maps to business continuity'),
-- Chapter 12: Network Infrastructure Management
('CIS Controls', 'Chapter 12', (SELECT id FROM unified_compliance_categories WHERE name = 'Network Security'), 'CIS Chapter 12 maps to network security'),
-- Chapter 13: Network Monitoring and Defense
('CIS Controls', 'Chapter 13', (SELECT id FROM unified_compliance_categories WHERE name = 'Compliance & Audit'), 'CIS Chapter 13 maps to compliance and audit'),
-- Chapter 14: Security Awareness and Skills Training
('CIS Controls', 'Chapter 14', (SELECT id FROM unified_compliance_categories WHERE name = 'Security Awareness'), 'CIS Chapter 14 maps to security awareness'),
-- Chapter 15: Service Provider Management
('CIS Controls', 'Chapter 15', (SELECT id FROM unified_compliance_categories WHERE name = 'Supplier Risk'), 'CIS Chapter 15 maps to supplier risk'),
-- Chapter 16: Application Software Security
('CIS Controls', 'Chapter 16', (SELECT id FROM unified_compliance_categories WHERE name = 'Secure Development'), 'CIS Chapter 16 maps to secure development'),
-- Chapter 17: Incident Response Management
('CIS Controls', 'Chapter 17', (SELECT id FROM unified_compliance_categories WHERE name = 'Incident Response'), 'CIS Chapter 17 maps to incident response'),
-- Chapter 18: Penetration Testing
('CIS Controls', 'Chapter 18', (SELECT id FROM unified_compliance_categories WHERE name = 'Penetration Testing'), 'CIS Chapter 18 maps to penetration testing');

-- ISO 27001/27002 Domain Mappings
INSERT INTO framework_control_mappings (source_framework, source_section, target_category_id, mapping_notes) VALUES
-- ISO 27001 Clauses
('ISO 27001', '4', (SELECT id FROM unified_compliance_categories WHERE name = 'Governance & Leadership'), 'Context of organization'),
('ISO 27001', '5', (SELECT id FROM unified_compliance_categories WHERE name = 'Governance & Leadership'), 'Leadership'),
('ISO 27001', '6', (SELECT id FROM unified_compliance_categories WHERE name = 'Risk Management'), 'Planning and risk'),
('ISO 27001', '7', (SELECT id FROM unified_compliance_categories WHERE name = 'Governance & Leadership'), 'Support'),
('ISO 27001', '8', (SELECT id FROM unified_compliance_categories WHERE name = 'Governance & Leadership'), 'Operation'),
('ISO 27001', '9', (SELECT id FROM unified_compliance_categories WHERE name = 'Compliance & Audit'), 'Performance evaluation'),
('ISO 27001', '10', (SELECT id FROM unified_compliance_categories WHERE name = 'Governance & Leadership'), 'Improvement'),
-- ISO 27002 Controls
('ISO 27002', 'A.5', (SELECT id FROM unified_compliance_categories WHERE name = 'Governance & Leadership'), 'Organizational controls'),
('ISO 27002', 'A.6', (SELECT id FROM unified_compliance_categories WHERE name = 'Security Awareness'), 'People controls'),
('ISO 27002', 'A.7', (SELECT id FROM unified_compliance_categories WHERE name = 'Physical Security'), 'Physical controls'),
('ISO 27002', 'A.8', (SELECT id FROM unified_compliance_categories WHERE name = 'Access Control'), 'Technological controls');

-- GDPR Chapter Mappings
INSERT INTO framework_control_mappings (source_framework, source_chapter, target_category_id, mapping_notes) VALUES
('GDPR', 'Chapter II', (SELECT id FROM unified_compliance_categories WHERE name = 'GDPR Unified Compliance'), 'Principles'),
('GDPR', 'Chapter III', (SELECT id FROM unified_compliance_categories WHERE name = 'GDPR Unified Compliance'), 'Rights of data subject'),
('GDPR', 'Chapter IV', (SELECT id FROM unified_compliance_categories WHERE name = 'GDPR Unified Compliance'), 'Controller and processor'),
('GDPR', 'Chapter V', (SELECT id FROM unified_compliance_categories WHERE name = 'GDPR Unified Compliance'), 'International transfers');

-- ============================================================================
-- Sample Aggregation Rules
-- ============================================================================

INSERT INTO aggregation_rules (rule_name, rule_type, condition_query, aggregation_template, priority) VALUES
(
    'merge_access_control_requirements',
    'merge',
    'category = ''Access Control'' AND (title ILIKE ''%authentication%'' OR title ILIKE ''%authorization%'')',
    'Implement comprehensive access control including {list_all_requirements}',
    100
),
(
    'consolidate_risk_assessments',
    'consolidate',
    'title ILIKE ''%risk assessment%'' OR title ILIKE ''%risk analysis%''',
    'Conduct unified risk assessment covering {combine_unique_aspects}',
    90
),
(
    'reference_data_protection',
    'reference',
    'category = ''Data Protection'' AND title ILIKE ''%encryption%''',
    'Apply encryption controls as specified in {reference_standards}',
    80
);

-- Comments for documentation
COMMENT ON TABLE requirement_similarity_scores IS 'AI-computed similarity scores between requirements for intelligent grouping';
COMMENT ON TABLE requirement_clusters IS 'Groups of similar requirements across frameworks for unified implementation';
COMMENT ON TABLE requirement_cluster_members IS 'Membership of requirements in clusters with strength indicators';
COMMENT ON TABLE framework_control_mappings IS 'Maps framework sections/chapters to unified categories based on actual structure';
COMMENT ON TABLE aggregation_rules IS 'Rules for intelligently combining similar requirements';
COMMENT ON TABLE aggregated_requirements IS 'Results of applying aggregation rules to create unified requirements';