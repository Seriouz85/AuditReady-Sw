--
-- AI Unified Requirements Validation System Tables
--
-- This migration creates the database schema for persisting AI suggestions,
-- validation sessions, approvals, and change history for unified requirements validation.
--

-- 1. Unified Requirements Validation Sessions
-- Tracks validation sessions initiated by platform admins
CREATE TABLE IF NOT EXISTS unified_requirements_validation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name TEXT NOT NULL,
    initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    session_status TEXT NOT NULL DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'cancelled')),
    
    -- Session metadata
    total_requirements INTEGER DEFAULT 0,
    analyzed_requirements INTEGER DEFAULT 0,
    approved_suggestions INTEGER DEFAULT 0,
    rejected_suggestions INTEGER DEFAULT 0,
    
    -- Quality metrics for the session
    overall_quality_score DECIMAL(3,2),
    framework_coverage_score DECIMAL(3,2),
    requirements_needing_attention INTEGER DEFAULT 0,
    
    -- Diagnostics and performance
    analysis_duration_seconds INTEGER,
    session_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AI Requirements Analysis Results
-- Stores comprehensive AI analysis results for unified requirements
CREATE TABLE IF NOT EXISTS ai_requirements_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES unified_requirements_validation_sessions(id) ON DELETE CASCADE,
    
    -- Requirement identification
    requirement_id TEXT NOT NULL, -- Format: "category-letter" e.g. "governance-a"
    requirement_letter TEXT NOT NULL, -- a, b, c, etc.
    requirement_title TEXT NOT NULL,
    requirement_description TEXT,
    original_text TEXT NOT NULL,
    
    -- Length and structure analysis
    current_word_count INTEGER NOT NULL,
    optimal_word_range_min INTEGER DEFAULT 15,
    optimal_word_range_max INTEGER DEFAULT 25,
    length_compliance TEXT NOT NULL CHECK (length_compliance IN ('too_short', 'optimal', 'too_long')),
    
    -- Quality scoring (0.0 to 1.0)
    clarity_score DECIMAL(3,2) DEFAULT 0.0,
    completeness_score DECIMAL(3,2) DEFAULT 0.0,
    framework_coverage_score DECIMAL(3,2) DEFAULT 0.0,
    overall_confidence_score DECIMAL(3,2) DEFAULT 0.0,
    
    -- Framework analysis
    detected_frameworks TEXT[] DEFAULT '{}', -- Array of detected framework names
    mapped_standards_count INTEGER DEFAULT 0,
    missing_framework_coverage TEXT[] DEFAULT '{}',
    
    -- AI analysis metadata
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_model_version TEXT DEFAULT 'v1.0',
    analysis_duration_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(session_id, requirement_id)
);

-- 3. AI Suggestions for Requirements
-- Individual AI suggestions for improving unified requirements
CREATE TABLE IF NOT EXISTS ai_requirement_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES ai_requirements_analysis(id) ON DELETE CASCADE,
    session_id UUID REFERENCES unified_requirements_validation_sessions(id) ON DELETE CASCADE,
    
    -- Suggestion classification
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN (
        'length_optimization', 
        'framework_enhancement', 
        'clarity_improvement', 
        'completeness_addition'
    )),
    priority_level TEXT NOT NULL CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    
    -- Content changes
    current_text TEXT NOT NULL,
    suggested_text TEXT NOT NULL,
    rationale TEXT NOT NULL,
    framework_specific TEXT, -- Framework this suggestion is specific to
    
    -- Impact estimation
    estimated_word_change INTEGER DEFAULT 0,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    
    -- Approval workflow
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN (
        'pending', 
        'approved', 
        'rejected', 
        'requires_review'
    )),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    
    -- Bulk operation tracking
    bulk_operation_id UUID, -- Links suggestions processed together
    auto_approved BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Framework Coverage Analysis
-- Detailed analysis of framework coverage gaps per category
CREATE TABLE IF NOT EXISTS framework_coverage_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES unified_requirements_validation_sessions(id) ON DELETE CASCADE,
    
    framework_name TEXT NOT NULL, -- ISO 27001, NIS2, GDPR, etc.
    category_name TEXT NOT NULL,
    
    -- Coverage metrics
    coverage_percentage DECIMAL(5,2) DEFAULT 0.0,
    requirements_with_framework INTEGER DEFAULT 0,
    total_requirements INTEGER DEFAULT 0,
    
    -- Gap analysis
    missing_topics TEXT[] DEFAULT '{}',
    recommended_additions TEXT[] DEFAULT '{}',
    
    -- Standard mappings
    mapped_standards_count INTEGER DEFAULT 0,
    unmapped_standards_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(session_id, framework_name, category_name)
);

-- 5. Unified Requirements Change History
-- Tracks all changes made to unified requirements through the validation system
CREATE TABLE IF NOT EXISTS unified_requirements_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES unified_requirements_validation_sessions(id) ON DELETE CASCADE,
    
    -- Change identification
    requirement_id TEXT NOT NULL, -- Format: "category-letter"
    change_type TEXT NOT NULL CHECK (change_type IN (
        'content_update',
        'length_optimization', 
        'framework_enhancement',
        'clarity_improvement',
        'bulk_approval'
    )),
    
    -- Content changes
    original_content TEXT NOT NULL,
    updated_content TEXT NOT NULL,
    change_summary TEXT,
    
    -- Change metadata
    applied_suggestions UUID[] DEFAULT '{}', -- Array of suggestion IDs that were applied
    change_reason TEXT,
    framework_specific TEXT,
    word_count_change INTEGER DEFAULT 0,
    
    -- Approval and tracking
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Rollback capability
    can_rollback BOOLEAN DEFAULT TRUE,
    rollback_data JSONB, -- Store data needed for rollback
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Validation Session Metrics
-- Aggregate metrics and KPIs for validation sessions
CREATE TABLE IF NOT EXISTS validation_session_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES unified_requirements_validation_sessions(id) ON DELETE CASCADE,
    
    -- Performance metrics
    total_analysis_time_seconds INTEGER DEFAULT 0,
    average_requirement_analysis_time DECIMAL(6,2) DEFAULT 0.0,
    suggestions_generated INTEGER DEFAULT 0,
    suggestions_approved INTEGER DEFAULT 0,
    suggestions_rejected INTEGER DEFAULT 0,
    
    -- Quality improvement metrics
    quality_score_improvement DECIMAL(4,2) DEFAULT 0.0,
    framework_coverage_improvement DECIMAL(4,2) DEFAULT 0.0,
    word_count_optimization INTEGER DEFAULT 0,
    
    -- Framework-specific metrics
    framework_enhancements_applied INTEGER DEFAULT 0,
    clarity_improvements_applied INTEGER DEFAULT 0,
    length_optimizations_applied INTEGER DEFAULT 0,
    
    -- User interaction metrics
    bulk_operations_performed INTEGER DEFAULT 0,
    manual_reviews_performed INTEGER DEFAULT 0,
    rollbacks_performed INTEGER DEFAULT 0,
    
    -- Diagnostic information
    errors_encountered INTEGER DEFAULT 0,
    warnings_generated INTEGER DEFAULT 0,
    diagnostic_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(session_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_validation_sessions_category ON unified_requirements_validation_sessions(category_name);
CREATE INDEX IF NOT EXISTS idx_validation_sessions_status ON unified_requirements_validation_sessions(session_status);
CREATE INDEX IF NOT EXISTS idx_validation_sessions_initiated_by ON unified_requirements_validation_sessions(initiated_by);

CREATE INDEX IF NOT EXISTS idx_requirements_analysis_session ON ai_requirements_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_requirements_analysis_requirement ON ai_requirements_analysis(requirement_id);
CREATE INDEX IF NOT EXISTS idx_requirements_analysis_confidence ON ai_requirements_analysis(overall_confidence_score);

CREATE INDEX IF NOT EXISTS idx_suggestions_analysis ON ai_requirement_suggestions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_session ON ai_requirement_suggestions(session_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON ai_requirement_suggestions(approval_status);
CREATE INDEX IF NOT EXISTS idx_suggestions_priority ON ai_requirement_suggestions(priority_level);
CREATE INDEX IF NOT EXISTS idx_suggestions_type ON ai_requirement_suggestions(suggestion_type);

CREATE INDEX IF NOT EXISTS idx_framework_coverage_session ON framework_coverage_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_framework_coverage_framework ON framework_coverage_analysis(framework_name);

CREATE INDEX IF NOT EXISTS idx_change_history_session ON unified_requirements_change_history(session_id);
CREATE INDEX IF NOT EXISTS idx_change_history_requirement ON unified_requirements_change_history(requirement_id);
CREATE INDEX IF NOT EXISTS idx_change_history_type ON unified_requirements_change_history(change_type);

CREATE INDEX IF NOT EXISTS idx_session_metrics_session ON validation_session_metrics(session_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE unified_requirements_validation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requirements_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_requirement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_coverage_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_requirements_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_session_metrics ENABLE ROW LEVEL SECURITY;

-- Platform Admin access policies (no organization restrictions)
-- These tables are only accessible by platform administrators
CREATE POLICY "Platform admins can manage validation sessions" ON unified_requirements_validation_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

CREATE POLICY "Platform admins can manage requirements analysis" ON ai_requirements_analysis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

CREATE POLICY "Platform admins can manage suggestions" ON ai_requirement_suggestions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

CREATE POLICY "Platform admins can manage framework coverage" ON framework_coverage_analysis
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

CREATE POLICY "Platform admins can manage change history" ON unified_requirements_change_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

CREATE POLICY "Platform admins can manage session metrics" ON validation_session_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'platform_admin'
        )
    );

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to relevant tables
CREATE TRIGGER update_validation_sessions_updated_at 
    BEFORE UPDATE ON unified_requirements_validation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_analysis_updated_at 
    BEFORE UPDATE ON ai_requirements_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suggestions_updated_at 
    BEFORE UPDATE ON ai_requirement_suggestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_metrics_updated_at 
    BEFORE UPDATE ON validation_session_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE unified_requirements_validation_sessions IS 'Tracks AI validation sessions for unified requirements by platform admins';
COMMENT ON TABLE ai_requirements_analysis IS 'Stores detailed AI analysis results for individual unified requirements';
COMMENT ON TABLE ai_requirement_suggestions IS 'Individual AI suggestions for improving unified requirements with approval workflow';
COMMENT ON TABLE framework_coverage_analysis IS 'Framework-specific coverage analysis and gap identification';
COMMENT ON TABLE unified_requirements_change_history IS 'Complete audit trail of changes made to unified requirements';
COMMENT ON TABLE validation_session_metrics IS 'Performance and quality metrics for validation sessions';

-- Grant permissions to service role for backend operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;