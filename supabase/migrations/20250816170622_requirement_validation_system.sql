-- =====================================================
-- >à Neural Requirement Validation System
-- =====================================================
-- This migration creates the database schema for the RAG-powered
-- requirement validation system that validates unified requirements
-- against authoritative framework sources.

-- Create requirement_validations table
CREATE TABLE IF NOT EXISTS requirement_validations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES unified_requirements(id) ON DELETE CASCADE,
    
    -- Quality Metrics (0-100 scores)
    quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
    completeness_score INTEGER NOT NULL CHECK (completeness_score >= 0 AND completeness_score <= 100),
    framework_alignment INTEGER NOT NULL CHECK (framework_alignment >= 0 AND framework_alignment <= 100),
    
    -- Analysis Results
    missing_elements TEXT[] DEFAULT '{}',
    improvement_suggestions TEXT[] DEFAULT '{}',
    source_coverage JSONB DEFAULT '[]'::jsonb,
    
    -- Confidence and Metadata
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    validation_method TEXT DEFAULT 'neural_rag',
    
    -- Timestamps
    validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(requirement_id, validated_at)
);

-- Create framework_sources table for validation references
CREATE TABLE IF NOT EXISTS framework_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- "ISO 27001", "NIS2", "NIST", etc.
    version TEXT DEFAULT 'Latest',
    authority_score INTEGER NOT NULL CHECK (authority_score >= 1 AND authority_score <= 10),
    source_url TEXT,
    domain TEXT,
    
    -- Framework Metadata
    framework_type TEXT, -- "standard", "regulation", "guideline"
    jurisdiction TEXT, -- "EU", "US", "Global", etc.
    last_updated TIMESTAMPTZ,
    
    -- Content Analysis
    total_requirements INTEGER DEFAULT 0,
    categories_covered TEXT[] DEFAULT '{}',
    
    -- Knowledge Integration
    knowledge_source_id UUID REFERENCES knowledge_sources(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(name, version)
);

-- Create validation_reports table for comprehensive analysis
CREATE TABLE IF NOT EXISTS validation_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Report Metadata
    report_name TEXT NOT NULL,
    validation_scope TEXT[], -- Framework names included
    
    -- Overall Metrics
    overall_quality INTEGER NOT NULL CHECK (overall_quality >= 0 AND overall_quality <= 100),
    total_requirements INTEGER NOT NULL,
    validated_requirements INTEGER NOT NULL,
    
    -- Framework Coverage
    framework_coverage JSONB DEFAULT '{}'::jsonb,
    
    -- Critical Issues
    critical_gaps TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    
    -- Report Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'failed')),
    
    -- Validation Results Reference
    validation_ids UUID[] DEFAULT '{}',
    
    -- Timestamps
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(organization_id, report_name, generated_at)
);

-- Create improvement_tracking table
CREATE TABLE IF NOT EXISTS improvement_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requirement_id UUID NOT NULL REFERENCES unified_requirements(id) ON DELETE CASCADE,
    validation_id UUID NOT NULL REFERENCES requirement_validations(id) ON DELETE CASCADE,
    
    -- Improvement Details
    improvement_type TEXT NOT NULL, -- "missing_element", "clarity", "completeness", etc.
    suggestion TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Implementation Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    implemented_by UUID REFERENCES users(id),
    implementation_notes TEXT,
    
    -- Timestamps
    suggested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    implemented_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_requirement_validations_org_req 
    ON requirement_validations(organization_id, requirement_id);

CREATE INDEX IF NOT EXISTS idx_requirement_validations_quality 
    ON requirement_validations(quality_score DESC);

CREATE INDEX IF NOT EXISTS idx_requirement_validations_validated_at 
    ON requirement_validations(validated_at DESC);

CREATE INDEX IF NOT EXISTS idx_framework_sources_authority 
    ON framework_sources(authority_score DESC);

CREATE INDEX IF NOT EXISTS idx_framework_sources_name 
    ON framework_sources(name);

CREATE INDEX IF NOT EXISTS idx_validation_reports_org_generated 
    ON validation_reports(organization_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_improvement_tracking_requirement 
    ON improvement_tracking(requirement_id, status);

-- Create RLS policies
ALTER TABLE requirement_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_tracking ENABLE ROW LEVEL SECURITY;

-- RLS for requirement_validations
CREATE POLICY "Users can view validations for their organization" 
    ON requirement_validations FOR SELECT 
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert validations for their organization" 
    ON requirement_validations FOR INSERT 
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid()
        )
    );

-- RLS for framework_sources (global read, admin write)
CREATE POLICY "All authenticated users can view framework sources" 
    ON framework_sources FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Platform admins can manage framework sources" 
    ON framework_sources FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM platform_administrators 
            WHERE user_id = auth.uid()
        )
    );

-- RLS for validation_reports
CREATE POLICY "Users can view validation reports for their organization" 
    ON validation_reports FOR SELECT 
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create validation reports for their organization" 
    ON validation_reports FOR INSERT 
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid()
        )
    );

-- RLS for improvement_tracking
CREATE POLICY "Users can view improvements for their organization requirements" 
    ON improvement_tracking FOR SELECT 
    USING (
        requirement_id IN (
            SELECT ur.id FROM unified_requirements ur
            JOIN organization_users ou ON ur.organization_id = ou.organization_id
            WHERE ou.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage improvements for their organization requirements" 
    ON improvement_tracking FOR ALL 
    USING (
        requirement_id IN (
            SELECT ur.id FROM unified_requirements ur
            JOIN organization_users ou ON ur.organization_id = ou.organization_id
            WHERE ou.user_id = auth.uid()
        )
    );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_requirement_validation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_framework_source_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_improvement_tracking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_requirement_validation_timestamp
    BEFORE UPDATE ON requirement_validations
    FOR EACH ROW
    EXECUTE FUNCTION update_requirement_validation_timestamp();

CREATE TRIGGER trigger_update_framework_source_timestamp
    BEFORE UPDATE ON framework_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_framework_source_timestamp();

CREATE TRIGGER trigger_update_improvement_tracking_timestamp
    BEFORE UPDATE ON improvement_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_improvement_tracking_timestamp();

-- Insert default framework sources
INSERT INTO framework_sources (name, version, authority_score, framework_type, jurisdiction, source_url, domain) VALUES
('ISO 27001', '2022', 10, 'standard', 'Global', 'https://www.iso.org/standard/27001', 'iso.org'),
('NIST Cybersecurity Framework', '2.0', 9, 'guideline', 'US', 'https://csrc.nist.gov/Projects/cybersecurity-framework', 'csrc.nist.gov'),
('NIS2 Directive', '2022/2555', 9, 'regulation', 'EU', 'https://eur-lex.europa.eu/eli/dir/2022/2555', 'eur-lex.europa.eu'),
('CIS Controls', 'v8', 8, 'guideline', 'Global', 'https://www.cisecurity.org/controls', 'cisecurity.org'),
('SOC 2', 'Type II', 8, 'standard', 'US', 'https://www.aicpa.org/soc2', 'aicpa.org'),
('GDPR', '2016/679', 9, 'regulation', 'EU', 'https://eur-lex.europa.eu/eli/reg/2016/679', 'eur-lex.europa.eu'),
('CCPA', '2020', 8, 'regulation', 'US', 'https://oag.ca.gov/privacy/ccpa', 'oag.ca.gov')
ON CONFLICT (name, version) DO NOTHING;

-- Add helpful comments
COMMENT ON TABLE requirement_validations IS 'Neural validation results for unified requirements against framework sources';
COMMENT ON TABLE framework_sources IS 'Authoritative framework sources used for requirement validation';
COMMENT ON TABLE validation_reports IS 'Comprehensive validation reports for organizations';
COMMENT ON TABLE improvement_tracking IS 'Tracking implementation of validation-suggested improvements';

COMMENT ON COLUMN requirement_validations.quality_score IS 'Overall quality score (0-100) based on framework alignment, completeness, and clarity';
COMMENT ON COLUMN requirement_validations.source_coverage IS 'JSON array of framework coverage percentages and missing aspects';
COMMENT ON COLUMN framework_sources.authority_score IS 'Authority score (1-10) indicating the reliability and recognition of the source';
COMMENT ON COLUMN validation_reports.framework_coverage IS 'JSON object mapping framework names to coverage percentages';