-- ============================================================================
-- Unified Compliance Categories
-- Support for the Compliance Simplification feature
-- ============================================================================

-- Unified compliance categories (high-level groupings)
CREATE TABLE unified_compliance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    icon TEXT, -- Icon identifier for UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id)
);

-- Unified requirements within each category
CREATE TABLE unified_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES unified_compliance_categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sub_requirements TEXT[] NOT NULL, -- Array of detailed sub-requirements
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id)
);

-- Mapping between unified requirements and framework-specific requirements
CREATE TABLE unified_requirement_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unified_requirement_id UUID REFERENCES unified_requirements(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES requirements_library(id) ON DELETE CASCADE,
    mapping_strength TEXT CHECK (mapping_strength IN ('exact', 'strong', 'partial', 'related')) DEFAULT 'strong',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES platform_administrators(id),
    UNIQUE(unified_requirement_id, requirement_id)
);

-- Indexes for performance
CREATE INDEX idx_unified_requirements_category ON unified_requirements(category_id);
CREATE INDEX idx_unified_requirement_mappings_unified ON unified_requirement_mappings(unified_requirement_id);
CREATE INDEX idx_unified_requirement_mappings_requirement ON unified_requirement_mappings(requirement_id);

-- Enable RLS
ALTER TABLE unified_compliance_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_requirement_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Read access for all authenticated users, write access for platform admins only
CREATE POLICY "Read unified categories" ON unified_compliance_categories
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Admin manage unified categories" ON unified_compliance_categories
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Read unified requirements" ON unified_requirements
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Admin manage unified requirements" ON unified_requirements
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

CREATE POLICY "Read unified mappings" ON unified_requirement_mappings
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Admin manage unified mappings" ON unified_requirement_mappings
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE email = auth.email() AND is_active = true
        )
    );

-- Triggers for timestamp updates
CREATE TRIGGER update_unified_compliance_categories_updated_at 
    BEFORE UPDATE ON unified_compliance_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unified_requirements_updated_at 
    BEFORE UPDATE ON unified_requirements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE unified_compliance_categories IS 'High-level unified compliance categories for simplification';
COMMENT ON TABLE unified_requirements IS 'Unified requirements that map to multiple framework-specific requirements';
COMMENT ON TABLE unified_requirement_mappings IS 'Mappings between unified requirements and framework-specific requirements';

-- ============================================================================
-- Initial Data: Unified Compliance Categories
-- Based on the hardcoded data from ComplianceSimplification.tsx
-- ============================================================================

-- Insert unified categories
INSERT INTO unified_compliance_categories (name, description, sort_order) VALUES
('Governance & Leadership', 'Comprehensive governance framework with leadership commitment and organizational structure', 1),
('Risk Management', 'Enterprise risk assessment, treatment, and continuous monitoring', 2),
('Asset & Data Management', 'Comprehensive inventory, classification, and lifecycle management', 3),
('Access Control & Identity', 'Identity management, authentication, authorization, and privileged access', 4),
('Physical & Environmental', 'Physical security controls and environmental protection measures', 5),
('Network & Communications', 'Network security architecture, segmentation, and secure communications', 6),
('System Security & Hardening', 'Secure configuration, vulnerability management, and system protection', 7),
('Application & Development', 'Secure development lifecycle, testing, and application security', 8),
('Incident & Continuity', 'Incident response, business continuity, and disaster recovery', 9),
('Compliance & Audit', 'Compliance monitoring, audit management, and regulatory adherence', 10),
('Supplier & Third Party', 'Vendor risk management and supply chain security', 11),
('Privacy & Data Protection', 'Data subject rights, consent management, and privacy controls', 12);

-- Note: The actual unified requirements and mappings would need to be inserted
-- based on a comprehensive analysis of all frameworks. This migration creates
-- the structure, but the data population should be done through a separate
-- data migration or admin interface.