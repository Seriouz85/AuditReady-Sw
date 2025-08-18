-- =====================================================
-- >à Category Comprehensive Guidance System
-- =====================================================
-- This migration creates the database schema for storing
-- comprehensive unified guidance for each compliance category
-- using all available frameworks for maximum coverage.

-- Create category_comprehensive_guidance table
CREATE TABLE IF NOT EXISTS category_comprehensive_guidance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES unified_compliance_categories(id) ON DELETE CASCADE,
    
    -- Category Information
    category_name TEXT NOT NULL,
    
    -- Comprehensive Guidance Content
    comprehensive_guidance TEXT NOT NULL,
    frameworks_included TEXT[] DEFAULT '{}',
    
    -- Quality Metrics
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    coverage_percentage INTEGER NOT NULL CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
    
    -- Requirements Context
    total_requirements INTEGER DEFAULT 0,
    
    -- Extracted Content Elements
    key_topics TEXT[] DEFAULT '{}',
    implementation_steps TEXT[] DEFAULT '{}',
    compliance_notes TEXT[] DEFAULT '{}',
    
    -- Generation Metadata
    generation_method TEXT DEFAULT 'rag_comprehensive',
    last_generated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(organization_id, category_id)
);

-- Create category_guidance_analytics table for tracking usage
CREATE TABLE IF NOT EXISTS category_guidance_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guidance_id UUID NOT NULL REFERENCES category_comprehensive_guidance(id) ON DELETE CASCADE,
    
    -- Usage Analytics
    views_count INTEGER DEFAULT 0,
    exports_count INTEGER DEFAULT 0,
    last_viewed TIMESTAMPTZ,
    last_exported TIMESTAMPTZ,
    
    -- User Feedback
    user_ratings DECIMAL(2,1)[] DEFAULT '{}', -- Array of 1-5 ratings
    average_rating DECIMAL(2,1),
    feedback_comments TEXT[] DEFAULT '{}',
    
    -- Performance Metrics
    generation_time_ms INTEGER,
    content_length INTEGER,
    frameworks_count INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_category_comprehensive_guidance_org_category 
    ON category_comprehensive_guidance(organization_id, category_id);

CREATE INDEX IF NOT EXISTS idx_category_comprehensive_guidance_category_name 
    ON category_comprehensive_guidance(category_name);

CREATE INDEX IF NOT EXISTS idx_category_comprehensive_guidance_last_generated 
    ON category_comprehensive_guidance(last_generated DESC);

CREATE INDEX IF NOT EXISTS idx_category_comprehensive_guidance_coverage 
    ON category_comprehensive_guidance(coverage_percentage DESC);

CREATE INDEX IF NOT EXISTS idx_category_guidance_analytics_guidance_id 
    ON category_guidance_analytics(guidance_id);

-- Create RLS policies
ALTER TABLE category_comprehensive_guidance ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_guidance_analytics ENABLE ROW LEVEL SECURITY;

-- RLS for category_comprehensive_guidance
CREATE POLICY "Users can view comprehensive guidance for their organization" 
    ON category_comprehensive_guidance FOR SELECT 
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create comprehensive guidance for their organization" 
    ON category_comprehensive_guidance FOR INSERT 
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update comprehensive guidance for their organization" 
    ON category_comprehensive_guidance FOR UPDATE 
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_users 
            WHERE user_id = auth.uid()
        )
    );

-- RLS for category_guidance_analytics
CREATE POLICY "Users can view analytics for their organization guidance" 
    ON category_guidance_analytics FOR SELECT 
    USING (
        guidance_id IN (
            SELECT id FROM category_comprehensive_guidance ccg
            JOIN organization_users ou ON ccg.organization_id = ou.organization_id
            WHERE ou.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create analytics for their organization guidance" 
    ON category_guidance_analytics FOR INSERT 
    WITH CHECK (
        guidance_id IN (
            SELECT id FROM category_comprehensive_guidance ccg
            JOIN organization_users ou ON ccg.organization_id = ou.organization_id
            WHERE ou.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update analytics for their organization guidance" 
    ON category_guidance_analytics FOR UPDATE 
    USING (
        guidance_id IN (
            SELECT id FROM category_comprehensive_guidance ccg
            JOIN organization_users ou ON ccg.organization_id = ou.organization_id
            WHERE ou.user_id = auth.uid()
        )
    );

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_category_guidance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_category_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update analytics when guidance is viewed
CREATE OR REPLACE FUNCTION increment_guidance_views(guidance_uuid UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO category_guidance_analytics (guidance_id, views_count, last_viewed)
    VALUES (guidance_uuid, 1, NOW())
    ON CONFLICT (guidance_id) 
    DO UPDATE SET 
        views_count = category_guidance_analytics.views_count + 1,
        last_viewed = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate average rating
CREATE OR REPLACE FUNCTION update_guidance_rating(guidance_uuid UUID, rating DECIMAL(2,1))
RETURNS VOID AS $$
BEGIN
    INSERT INTO category_guidance_analytics (guidance_id, user_ratings, average_rating)
    VALUES (guidance_uuid, ARRAY[rating], rating)
    ON CONFLICT (guidance_id) 
    DO UPDATE SET 
        user_ratings = array_append(category_guidance_analytics.user_ratings, rating),
        average_rating = (
            SELECT AVG(unnest) 
            FROM unnest(array_append(category_guidance_analytics.user_ratings, rating))
        ),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_category_guidance_timestamp
    BEFORE UPDATE ON category_comprehensive_guidance
    FOR EACH ROW
    EXECUTE FUNCTION update_category_guidance_timestamp();

CREATE TRIGGER trigger_update_category_analytics_timestamp
    BEFORE UPDATE ON category_guidance_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_category_analytics_timestamp();

-- Add helpful comments
COMMENT ON TABLE category_comprehensive_guidance IS 'Comprehensive unified guidance for compliance categories using all available frameworks';
COMMENT ON TABLE category_guidance_analytics IS 'Analytics and usage tracking for category comprehensive guidance';

COMMENT ON COLUMN category_comprehensive_guidance.comprehensive_guidance IS 'Detailed guidance text covering all frameworks and implementation aspects';
COMMENT ON COLUMN category_comprehensive_guidance.frameworks_included IS 'Array of framework names used to generate this guidance';
COMMENT ON COLUMN category_comprehensive_guidance.coverage_percentage IS 'Estimated coverage percentage based on content analysis';
COMMENT ON COLUMN category_comprehensive_guidance.key_topics IS 'Extracted key topics and themes from the guidance';
COMMENT ON COLUMN category_comprehensive_guidance.implementation_steps IS 'Extracted implementation steps and procedures';
COMMENT ON COLUMN category_comprehensive_guidance.compliance_notes IS 'Framework-specific compliance notes and requirements';