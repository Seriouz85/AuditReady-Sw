-- Migration: Phase 2 - Industry Benchmarking and Advanced Analytics
-- Purpose: Enable organizations to compare their compliance maturity with industry peers

-- 1. Create industry benchmarks table (anonymized aggregated data)
CREATE TABLE IF NOT EXISTS industry_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_id UUID NOT NULL REFERENCES standards_library(id),
    requirement_id UUID NOT NULL REFERENCES requirements_library(id),
    
    -- Segmentation criteria
    industry_sector TEXT NOT NULL,
    company_size_range TEXT NOT NULL CHECK (company_size_range IN (
        '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'
    )),
    region TEXT DEFAULT 'global',
    
    -- Benchmark metrics
    sample_size INTEGER NOT NULL CHECK (sample_size >= 5), -- Minimum for anonymity
    average_fulfillment_percentage NUMERIC(5,2),
    median_fulfillment_percentage NUMERIC(5,2),
    percentile_25 NUMERIC(5,2),
    percentile_75 NUMERIC(5,2),
    percentile_90 NUMERIC(5,2),
    
    -- Implementation metrics
    average_implementation_days INTEGER,
    median_implementation_days INTEGER,
    common_evidence_types TEXT[],
    
    -- Maturity distribution
    maturity_distribution JSONB DEFAULT '{
        "level_1": 0,
        "level_2": 0,
        "level_3": 0,
        "level_4": 0,
        "level_5": 0
    }'::JSONB,
    
    -- Metadata
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    data_freshness_days INTEGER GENERATED ALWAYS AS (
        CURRENT_DATE - calculation_date
    ) STORED,
    
    -- Ensure uniqueness per segment
    CONSTRAINT unique_benchmark_segment UNIQUE (
        standard_id, requirement_id, industry_sector, 
        company_size_range, region, calculation_date
    )
);

CREATE INDEX idx_benchmarks_lookup ON industry_benchmarks(
    standard_id, industry_sector, company_size_range
);
CREATE INDEX idx_benchmarks_freshness ON industry_benchmarks(data_freshness_days);

-- 2. Create compliance insights table
CREATE TABLE IF NOT EXISTS compliance_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN (
        'quick_win', 'high_impact', 'trending_up', 'trending_down',
        'benchmark_leader', 'benchmark_laggard', 'resource_optimization'
    )),
    
    -- Insight details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'success')),
    
    -- Related entities
    standard_id UUID REFERENCES standards_library(id),
    requirement_ids UUID[],
    
    -- Recommendations
    recommended_actions JSONB,
    estimated_effort_hours INTEGER,
    potential_impact_score INTEGER CHECK (potential_impact_score BETWEEN 1 AND 10),
    
    -- Tracking
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_by UUID REFERENCES users(id),
    dismissed_at TIMESTAMPTZ,
    is_actioned BOOLEAN DEFAULT false,
    actioned_at TIMESTAMPTZ,
    
    -- Metadata
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0 AND 1)
);

CREATE INDEX idx_insights_org_active ON compliance_insights(organization_id, is_dismissed, expires_at);
CREATE INDEX idx_insights_type ON compliance_insights(insight_type, generated_at);

-- 3. Create requirement dependency mapping
CREATE TABLE IF NOT EXISTS requirement_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID NOT NULL REFERENCES requirements_library(id),
    depends_on_requirement_id UUID NOT NULL REFERENCES requirements_library(id),
    dependency_type TEXT NOT NULL CHECK (dependency_type IN (
        'prerequisite', 'enhances', 'conflicts_with', 'related_to'
    )),
    strength TEXT NOT NULL CHECK (strength IN ('weak', 'moderate', 'strong')),
    description TEXT,
    
    CONSTRAINT no_self_dependency CHECK (requirement_id != depends_on_requirement_id),
    CONSTRAINT unique_dependency UNIQUE (requirement_id, depends_on_requirement_id)
);

CREATE INDEX idx_dependencies_requirement ON requirement_dependencies(requirement_id);
CREATE INDEX idx_dependencies_depends_on ON requirement_dependencies(depends_on_requirement_id);

-- 4. Create compliance velocity tracking
CREATE TABLE IF NOT EXISTS compliance_velocity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    standard_id UUID NOT NULL REFERENCES standards_library(id),
    
    -- Snapshot data
    snapshot_date DATE NOT NULL,
    total_requirements INTEGER NOT NULL,
    fulfilled_count INTEGER NOT NULL,
    partially_fulfilled_count INTEGER NOT NULL,
    not_fulfilled_count INTEGER NOT NULL,
    not_applicable_count INTEGER NOT NULL,
    
    -- Calculated metrics
    fulfillment_percentage NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN (total_requirements - not_applicable_count) > 0 
            THEN ((fulfilled_count + (partially_fulfilled_count * 0.5))::NUMERIC / 
                  (total_requirements - not_applicable_count) * 100)
            ELSE 0
        END
    ) STORED,
    
    -- Velocity metrics (calculated from previous snapshot)
    daily_velocity NUMERIC(5,2), -- Percentage points per day
    projected_completion_date DATE,
    
    CONSTRAINT unique_velocity_snapshot UNIQUE (organization_id, standard_id, snapshot_date)
);

CREATE INDEX idx_velocity_org_standard ON compliance_velocity(organization_id, standard_id, snapshot_date DESC);

-- 5. Function to calculate and store benchmarks
CREATE OR REPLACE FUNCTION calculate_industry_benchmarks(
    p_industry_sector TEXT DEFAULT NULL,
    p_company_size_range TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_benchmarks_created INTEGER := 0;
BEGIN
    -- Delete old benchmarks (older than 90 days)
    DELETE FROM industry_benchmarks 
    WHERE calculation_date < CURRENT_DATE - INTERVAL '90 days';
    
    -- Calculate new benchmarks
    INSERT INTO industry_benchmarks (
        standard_id, requirement_id, industry_sector, 
        company_size_range, sample_size,
        average_fulfillment_percentage,
        median_fulfillment_percentage,
        percentile_25, percentile_75, percentile_90,
        average_implementation_days
    )
    SELECT 
        rl.standard_id,
        rl.id as requirement_id,
        COALESCE(p_industry_sector, o.industry, 'all'),
        COALESCE(p_company_size_range, o.company_size, 'all'),
        COUNT(DISTINCT o.id) as sample_size,
        AVG(orr.fulfillment_percentage)::NUMERIC(5,2),
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY orr.fulfillment_percentage)::NUMERIC(5,2),
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY orr.fulfillment_percentage)::NUMERIC(5,2),
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY orr.fulfillment_percentage)::NUMERIC(5,2),
        PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY orr.fulfillment_percentage)::NUMERIC(5,2),
        AVG(EXTRACT(EPOCH FROM (orr.updated_at - orr.created_at))/86400)::INTEGER
    FROM requirements_library rl
    JOIN organization_requirements orr ON rl.id = orr.requirement_id
    JOIN organizations o ON orr.organization_id = o.id
    WHERE orr.status != 'not-applicable'
      AND (p_industry_sector IS NULL OR o.industry = p_industry_sector)
      AND (p_company_size_range IS NULL OR o.company_size = p_company_size_range)
    GROUP BY rl.standard_id, rl.id, o.industry, o.company_size
    HAVING COUNT(DISTINCT o.id) >= 5  -- Minimum sample size for privacy
    ON CONFLICT (standard_id, requirement_id, industry_sector, company_size_range, region, calculation_date)
    DO NOTHING;
    
    GET DIAGNOSTICS v_benchmarks_created = ROW_COUNT;
    
    RETURN v_benchmarks_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to generate insights for an organization
CREATE OR REPLACE FUNCTION generate_compliance_insights(p_organization_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_insights_created INTEGER := 0;
    v_org_record RECORD;
    v_requirement RECORD;
BEGIN
    -- Get organization details
    SELECT * INTO v_org_record FROM organizations WHERE id = p_organization_id;
    
    -- Clear old insights
    DELETE FROM compliance_insights 
    WHERE organization_id = p_organization_id 
      AND expires_at < NOW();
    
    -- Generate "quick win" insights
    FOR v_requirement IN
        SELECT 
            orr.*,
            rl.title,
            rl.standard_id,
            b.average_implementation_days
        FROM organization_requirements orr
        JOIN requirements_library rl ON orr.requirement_id = rl.id
        LEFT JOIN industry_benchmarks b ON 
            b.requirement_id = rl.id 
            AND b.industry_sector = v_org_record.industry
            AND b.company_size_range = v_org_record.company_size
        WHERE orr.organization_id = p_organization_id
          AND orr.status = 'not-fulfilled'
          AND orr.fulfillment_percentage >= 70  -- Almost complete
          AND b.average_implementation_days <= 7  -- Quick to implement
    LOOP
        INSERT INTO compliance_insights (
            organization_id, insight_type, title, description,
            severity, standard_id, requirement_ids,
            estimated_effort_hours, potential_impact_score
        ) VALUES (
            p_organization_id, 'quick_win',
            format('Quick Win: %s', v_requirement.title),
            format('This requirement is %s%% complete and typically takes only %s days to finish',
                v_requirement.fulfillment_percentage, 
                v_requirement.average_implementation_days),
            'success', v_requirement.standard_id, 
            ARRAY[v_requirement.requirement_id],
            v_requirement.average_implementation_days * 8,
            8
        );
        v_insights_created := v_insights_created + 1;
    END LOOP;
    
    -- Add more insight generation logic here...
    
    RETURN v_insights_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create views for easier access
CREATE OR REPLACE VIEW organization_benchmark_comparison AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    rl.id as requirement_id,
    rl.title as requirement_title,
    orr.fulfillment_percentage as org_fulfillment,
    b.median_fulfillment_percentage as industry_median,
    orr.fulfillment_percentage - b.median_fulfillment_percentage as delta_from_median,
    CASE 
        WHEN orr.fulfillment_percentage >= b.percentile_75 THEN 'Above Average'
        WHEN orr.fulfillment_percentage >= b.percentile_25 THEN 'Average'
        ELSE 'Below Average'
    END as performance_tier
FROM organizations o
JOIN organization_requirements orr ON o.id = orr.organization_id
JOIN requirements_library rl ON orr.requirement_id = rl.id
LEFT JOIN industry_benchmarks b ON 
    b.requirement_id = rl.id 
    AND b.industry_sector = o.industry
    AND b.company_size_range = o.company_size
    AND b.data_freshness_days <= 30;

-- Grant permissions
GRANT SELECT ON industry_benchmarks TO authenticated;
GRANT SELECT ON compliance_insights TO authenticated;
GRANT SELECT ON requirement_dependencies TO authenticated;
GRANT SELECT ON compliance_velocity TO authenticated;
GRANT SELECT ON organization_benchmark_comparison TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_industry_benchmarks TO authenticated;
GRANT EXECUTE ON FUNCTION generate_compliance_insights TO authenticated;

-- Enable RLS
ALTER TABLE compliance_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_velocity ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their organization's insights"
    ON compliance_insights FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY "Users can update their organization's insights"
    ON compliance_insights FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

CREATE POLICY "Users can view their organization's velocity"
    ON compliance_velocity FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_users 
        WHERE user_id = auth.uid() AND status = 'active'
    ));

-- Comments
COMMENT ON TABLE industry_benchmarks IS 'Anonymized aggregated compliance data for industry comparison';
COMMENT ON TABLE compliance_insights IS 'AI-generated insights and recommendations for improving compliance';
COMMENT ON TABLE compliance_velocity IS 'Historical tracking of compliance progress over time';
COMMENT ON FUNCTION calculate_industry_benchmarks IS 'Aggregate anonymized compliance data for benchmarking';