-- AI Processing Enhancements Database Schema
-- Supports enhanced AI guidance processing, recommendations, and analytics

-- ================================
-- AI PROCESSING HISTORY
-- ================================

-- Track AI processing attempts and detailed results
CREATE TABLE ai_processing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processing_id TEXT NOT NULL UNIQUE,
  
  -- Request context
  category_id TEXT NOT NULL,
  requirement_title TEXT NOT NULL,
  requirement_description TEXT,
  organization_id UUID,
  user_id UUID REFERENCES auth.users(id),
  
  -- Processing configuration
  processing_method TEXT NOT NULL CHECK (processing_method IN ('category-specific', 'ai-enhanced', 'standard-rag', 'rule-based')),
  selected_frameworks JSONB DEFAULT '{}',
  content_constraints JSONB DEFAULT '{}',
  processing_options JSONB DEFAULT '{}',
  
  -- Results and quality
  generated_content TEXT NOT NULL,
  content_rows INTEGER DEFAULT 0,
  quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
  relevance_score FLOAT CHECK (relevance_score >= 0 AND relevance_score <= 1),
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Sub-section and framework mappings
  sub_section_mappings JSONB DEFAULT '[]',
  framework_mappings JSONB DEFAULT '[]',
  
  -- AI validation results
  validation_result JSONB DEFAULT '{}',
  validation_passed BOOLEAN DEFAULT FALSE,
  validation_issues JSONB DEFAULT '[]',
  
  -- Performance metrics
  processing_time_ms INTEGER NOT NULL,
  ai_model TEXT DEFAULT 'gemini-pro',
  token_usage JSONB DEFAULT '{}',
  api_cost_estimate DECIMAL(10,6),
  
  -- Error handling
  errors TEXT[] DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',
  fallback_used BOOLEAN DEFAULT FALSE,
  fallback_reason TEXT,
  
  -- Knowledge sources
  sources_used TEXT[] DEFAULT '{}',
  knowledge_quality FLOAT DEFAULT 0.0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_processing_history_category ON ai_processing_history(category_id);
CREATE INDEX idx_ai_processing_history_method ON ai_processing_history(processing_method);
CREATE INDEX idx_ai_processing_history_user ON ai_processing_history(user_id);
CREATE INDEX idx_ai_processing_history_quality ON ai_processing_history(quality_score DESC);
CREATE INDEX idx_ai_processing_history_created ON ai_processing_history(created_at DESC);
CREATE INDEX idx_ai_processing_history_processing_id ON ai_processing_history(processing_id);

-- ================================
-- RECOMMENDATION ANALYTICS
-- ================================

-- Track recommendation generation and user interactions
CREATE TABLE recommendation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  category_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  session_id TEXT,
  
  -- Recommendation details
  recommendations_count INTEGER DEFAULT 0,
  recommendation_types TEXT[] DEFAULT '{}',
  average_confidence FLOAT DEFAULT 0.0,
  
  -- Performance
  processing_time_ms INTEGER NOT NULL,
  generation_method TEXT DEFAULT 'ai-enhanced',
  
  -- User interaction tracking
  recommendations_viewed INTEGER DEFAULT 0,
  recommendations_applied INTEGER DEFAULT 0,
  user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),
  user_satisfaction FLOAT CHECK (user_satisfaction >= 0 AND user_satisfaction <= 1),
  
  -- Quality metrics
  recommendation_accuracy FLOAT DEFAULT 0.0,
  implementation_success_rate FLOAT DEFAULT 0.0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recommendation_analytics_category ON recommendation_analytics(category_id);
CREATE INDEX idx_recommendation_analytics_user ON recommendation_analytics(user_id);
CREATE INDEX idx_recommendation_analytics_created ON recommendation_analytics(created_at DESC);
CREATE INDEX idx_recommendation_analytics_satisfaction ON recommendation_analytics(user_satisfaction DESC);

-- ================================
-- CATEGORY PROCESSING SPECS
-- ================================

-- Store category-specific processing specifications and performance
CREATE TABLE category_processing_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL UNIQUE,
  
  -- Category specification
  category_name TEXT NOT NULL,
  description TEXT,
  sub_sections JSONB DEFAULT '[]',
  priority_frameworks TEXT[] DEFAULT '{}',
  key_topics TEXT[] DEFAULT '{}',
  
  -- Content constraints
  content_constraints JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  processing_hints JSONB DEFAULT '{}',
  
  -- Performance tracking
  total_processings INTEGER DEFAULT 0,
  average_quality_score FLOAT DEFAULT 0.0,
  average_processing_time_ms INTEGER DEFAULT 0,
  success_rate FLOAT DEFAULT 0.0,
  
  -- Specification metadata
  specification_version TEXT DEFAULT '1.0',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  -- Learning and optimization
  optimization_data JSONB DEFAULT '{}',
  performance_trends JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_category_processing_specs_category ON category_processing_specs(category_id);
CREATE INDEX idx_category_processing_specs_quality ON category_processing_specs(average_quality_score DESC);
CREATE INDEX idx_category_processing_specs_updated ON category_processing_specs(updated_at DESC);

-- ================================
-- CONTENT ENHANCEMENT LOGS
-- ================================

-- Track content enhancement operations and results
CREATE TABLE content_enhancement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Enhancement context
  enhancement_type TEXT NOT NULL CHECK (enhancement_type IN ('length_optimization', 'quality_improvement', 'framework_alignment', 'structure_enhancement', 'tone_adjustment')),
  category_id TEXT NOT NULL,
  processing_id TEXT,
  
  -- Original and enhanced content
  original_content TEXT NOT NULL,
  enhanced_content TEXT NOT NULL,
  
  -- Enhancement details
  enhancement_method TEXT NOT NULL CHECK (enhancement_method IN ('ai_compression', 'ai_expansion', 'rule_based', 'hybrid')),
  enhancement_parameters JSONB DEFAULT '{}',
  
  -- Quality metrics
  quality_improvement FLOAT DEFAULT 0.0,
  relevance_improvement FLOAT DEFAULT 0.0,
  readability_improvement FLOAT DEFAULT 0.0,
  
  -- Performance
  enhancement_time_ms INTEGER DEFAULT 0,
  token_usage JSONB DEFAULT '{}',
  ai_confidence FLOAT DEFAULT 0.0,
  
  -- Validation
  validation_passed BOOLEAN DEFAULT FALSE,
  validation_issues JSONB DEFAULT '[]',
  
  -- User feedback
  user_accepted BOOLEAN,
  user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),
  user_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_content_enhancement_logs_type ON content_enhancement_logs(enhancement_type);
CREATE INDEX idx_content_enhancement_logs_category ON content_enhancement_logs(category_id);
CREATE INDEX idx_content_enhancement_logs_processing ON content_enhancement_logs(processing_id);
CREATE INDEX idx_content_enhancement_logs_created ON content_enhancement_logs(created_at DESC);
CREATE INDEX idx_content_enhancement_logs_quality ON content_enhancement_logs(quality_improvement DESC);

-- ================================
-- FRAMEWORK ALIGNMENT TRACKING
-- ================================

-- Track framework alignment analysis and improvements
CREATE TABLE framework_alignment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Context
  category_id TEXT NOT NULL,
  processing_id TEXT,
  framework_name TEXT NOT NULL,
  
  -- Alignment analysis
  alignment_score FLOAT CHECK (alignment_score >= 0 AND alignment_score <= 1),
  coverage_percentage FLOAT CHECK (coverage_percentage >= 0 AND coverage_percentage <= 100),
  missing_elements TEXT[] DEFAULT '{}',
  conflicting_requirements TEXT[] DEFAULT '{}',
  
  -- Improvement actions
  improvement_suggestions JSONB DEFAULT '[]',
  applied_improvements JSONB DEFAULT '[]',
  improvement_effectiveness FLOAT DEFAULT 0.0,
  
  -- Validation
  expert_reviewed BOOLEAN DEFAULT FALSE,
  expert_notes TEXT,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'needs_review', 'rejected')),
  
  -- Performance tracking
  user_satisfaction FLOAT CHECK (user_satisfaction >= 0 AND user_satisfaction <= 1),
  implementation_success BOOLEAN,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_framework_alignment_tracking_category ON framework_alignment_tracking(category_id);
CREATE INDEX idx_framework_alignment_tracking_framework ON framework_alignment_tracking(framework_name);
CREATE INDEX idx_framework_alignment_tracking_score ON framework_alignment_tracking(alignment_score DESC);
CREATE INDEX idx_framework_alignment_tracking_status ON framework_alignment_tracking(validation_status);

-- ================================
-- AI PERFORMANCE METRICS
-- ================================

-- Daily aggregated AI performance metrics
CREATE TABLE ai_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_recorded DATE NOT NULL,
  
  -- Processing volume
  total_processings INTEGER DEFAULT 0,
  category_specific_processings INTEGER DEFAULT 0,
  ai_enhanced_processings INTEGER DEFAULT 0,
  standard_rag_processings INTEGER DEFAULT 0,
  fallback_processings INTEGER DEFAULT 0,
  
  -- Quality metrics
  average_quality_score FLOAT DEFAULT 0.0,
  average_relevance_score FLOAT DEFAULT 0.0,
  average_confidence_score FLOAT DEFAULT 0.0,
  quality_threshold_pass_rate FLOAT DEFAULT 0.0,
  
  -- Performance metrics
  average_processing_time_ms INTEGER DEFAULT 0,
  median_processing_time_ms INTEGER DEFAULT 0,
  p95_processing_time_ms INTEGER DEFAULT 0,
  timeout_rate FLOAT DEFAULT 0.0,
  
  -- User satisfaction
  average_user_satisfaction FLOAT DEFAULT 0.0,
  recommendation_acceptance_rate FLOAT DEFAULT 0.0,
  user_feedback_count INTEGER DEFAULT 0,
  
  -- Enhancement metrics
  content_enhancement_rate FLOAT DEFAULT 0.0,
  framework_alignment_rate FLOAT DEFAULT 0.0,
  recommendation_effectiveness FLOAT DEFAULT 0.0,
  
  -- Cost metrics
  total_token_usage BIGINT DEFAULT 0,
  estimated_api_cost DECIMAL(10,2) DEFAULT 0,
  cost_per_processing DECIMAL(10,4) DEFAULT 0,
  
  -- Error metrics
  error_rate FLOAT DEFAULT 0.0,
  fallback_rate FLOAT DEFAULT 0.0,
  validation_failure_rate FLOAT DEFAULT 0.0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint and indexes
CREATE UNIQUE INDEX idx_ai_performance_metrics_date ON ai_performance_metrics(date_recorded);
CREATE INDEX idx_ai_performance_metrics_created ON ai_performance_metrics(created_at DESC);
CREATE INDEX idx_ai_performance_metrics_quality ON ai_performance_metrics(average_quality_score DESC);

-- ================================
-- ROW LEVEL SECURITY
-- ================================

-- Enable RLS on all new tables
ALTER TABLE ai_processing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_processing_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_enhancement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_alignment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;

-- AI processing history policies (users can see their own, admins see all)
CREATE POLICY "ai_processing_history_user_own" ON ai_processing_history FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);
CREATE POLICY "ai_processing_history_insert" ON ai_processing_history FOR INSERT WITH CHECK (true);

-- Recommendation analytics policies
CREATE POLICY "recommendation_analytics_user_own" ON recommendation_analytics FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);
CREATE POLICY "recommendation_analytics_insert" ON recommendation_analytics FOR INSERT WITH CHECK (true);

-- Category specs policies (read for all users, manage for admins)
CREATE POLICY "category_processing_specs_select" ON category_processing_specs FOR SELECT USING (true);
CREATE POLICY "category_processing_specs_manage" ON category_processing_specs FOR ALL USING (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);

-- Content enhancement logs policies
CREATE POLICY "content_enhancement_logs_select" ON content_enhancement_logs FOR SELECT USING (true);
CREATE POLICY "content_enhancement_logs_insert" ON content_enhancement_logs FOR INSERT WITH CHECK (true);

-- Framework alignment policies
CREATE POLICY "framework_alignment_tracking_select" ON framework_alignment_tracking FOR SELECT USING (true);
CREATE POLICY "framework_alignment_tracking_insert" ON framework_alignment_tracking FOR INSERT WITH CHECK (true);
CREATE POLICY "framework_alignment_tracking_update" ON framework_alignment_tracking FOR UPDATE USING (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);

-- AI performance metrics policies (admin only)
CREATE POLICY "ai_performance_metrics_admin_only" ON ai_performance_metrics FOR ALL USING (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);

-- ================================
-- TRIGGERS AND FUNCTIONS
-- ================================

-- Update updated_at timestamps
CREATE TRIGGER update_ai_processing_history_updated_at BEFORE UPDATE ON ai_processing_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_category_processing_specs_updated_at BEFORE UPDATE ON category_processing_specs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_framework_alignment_tracking_updated_at BEFORE UPDATE ON framework_alignment_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update category processing stats
CREATE OR REPLACE FUNCTION update_category_processing_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update category processing specifications with new performance data
  INSERT INTO category_processing_specs (
    category_id,
    category_name,
    total_processings,
    average_quality_score,
    average_processing_time_ms,
    success_rate
  )
  SELECT 
    NEW.category_id,
    NEW.category_id, -- Would be replaced with actual category name
    1,
    NEW.quality_score,
    NEW.processing_time_ms,
    CASE WHEN NEW.validation_passed THEN 1.0 ELSE 0.0 END
  ON CONFLICT (category_id) DO UPDATE SET
    total_processings = category_processing_specs.total_processings + 1,
    average_quality_score = (category_processing_specs.average_quality_score * category_processing_specs.total_processings + NEW.quality_score) / (category_processing_specs.total_processings + 1),
    average_processing_time_ms = (category_processing_specs.average_processing_time_ms * category_processing_specs.total_processings + NEW.processing_time_ms) / (category_processing_specs.total_processings + 1),
    success_rate = (category_processing_specs.success_rate * category_processing_specs.total_processings + CASE WHEN NEW.validation_passed THEN 1.0 ELSE 0.0 END) / (category_processing_specs.total_processings + 1),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_stats_on_processing AFTER INSERT ON ai_processing_history FOR EACH ROW EXECUTE FUNCTION update_category_processing_stats();

-- Function to update daily AI performance metrics
CREATE OR REPLACE FUNCTION update_daily_ai_metrics()
RETURNS void AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO ai_performance_metrics (
    date_recorded,
    total_processings,
    category_specific_processings,
    ai_enhanced_processings,
    standard_rag_processings,
    fallback_processings,
    average_quality_score,
    average_relevance_score,
    average_confidence_score,
    average_processing_time_ms,
    average_user_satisfaction,
    total_token_usage,
    error_rate,
    fallback_rate
  )
  SELECT 
    today_date,
    COUNT(*),
    COUNT(*) FILTER (WHERE processing_method = 'category-specific'),
    COUNT(*) FILTER (WHERE processing_method = 'ai-enhanced'),
    COUNT(*) FILTER (WHERE processing_method = 'standard-rag'),
    COUNT(*) FILTER (WHERE processing_method = 'rule-based'),
    AVG(quality_score),
    AVG(relevance_score),
    AVG(confidence_score),
    AVG(processing_time_ms),
    0.0, -- Would be calculated from user feedback
    COALESCE(SUM((token_usage->>'total')::bigint), 0),
    COUNT(*) FILTER (WHERE array_length(errors, 1) > 0)::float / COUNT(*),
    COUNT(*) FILTER (WHERE fallback_used)::float / COUNT(*)
  FROM ai_processing_history 
  WHERE created_at >= today_date
  ON CONFLICT (date_recorded) DO UPDATE SET
    total_processings = EXCLUDED.total_processings,
    category_specific_processings = EXCLUDED.category_specific_processings,
    ai_enhanced_processings = EXCLUDED.ai_enhanced_processings,
    standard_rag_processings = EXCLUDED.standard_rag_processings,
    fallback_processings = EXCLUDED.fallback_processings,
    average_quality_score = EXCLUDED.average_quality_score,
    average_relevance_score = EXCLUDED.average_relevance_score,
    average_confidence_score = EXCLUDED.average_confidence_score,
    average_processing_time_ms = EXCLUDED.average_processing_time_ms,
    total_token_usage = EXCLUDED.total_token_usage,
    error_rate = EXCLUDED.error_rate,
    fallback_rate = EXCLUDED.fallback_rate;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- INITIAL DATA SEEDING
-- ================================

-- Insert initial category processing specifications for key categories
INSERT INTO category_processing_specs (category_id, category_name, description, sub_sections, priority_frameworks, key_topics, content_constraints) VALUES
('governance', 'Information Security Governance', 'Leadership commitment and organizational structure', 
 '[{"id": "leadership_commitment", "name": "Leadership Commitment", "maxRows": 3, "priorityLevel": "critical"}, {"id": "organizational_structure", "name": "Organizational Structure", "maxRows": 3, "priorityLevel": "high"}]'::jsonb,
 ARRAY['ISO27001', 'NIST', 'NIS2'],
 ARRAY['leadership', 'governance', 'accountability', 'policy'],
 '{"minRows": 6, "maxRows": 8, "requiredKeywords": ["governance", "leadership"], "toneRequirements": ["professional", "authoritative"]}'::jsonb),

('access_control', 'Access Control', 'Identity management and access controls',
 '[{"id": "identity_management", "name": "Identity Management", "maxRows": 3, "priorityLevel": "critical"}, {"id": "authentication", "name": "Authentication Controls", "maxRows": 3, "priorityLevel": "critical"}]'::jsonb,
 ARRAY['ISO27001', 'NIST', 'CIS'],
 ARRAY['identity', 'authentication', 'authorization', 'access'],
 '{"minRows": 8, "maxRows": 10, "requiredKeywords": ["access", "authentication"], "toneRequirements": ["technical", "precise"]}'::jsonb),

('asset_management', 'Asset Management', 'Information asset identification and classification',
 '[{"id": "asset_inventory", "name": "Asset Inventory", "maxRows": 2, "priorityLevel": "critical"}, {"id": "asset_classification", "name": "Asset Classification", "maxRows": 3, "priorityLevel": "high"}]'::jsonb,
 ARRAY['ISO27001', 'NIST'],
 ARRAY['asset', 'classification', 'inventory', 'handling'],
 '{"minRows": 7, "maxRows": 9, "requiredKeywords": ["asset", "classification"], "toneRequirements": ["methodical", "comprehensive"]}'::jsonb);

-- Create initial daily metrics record
INSERT INTO ai_performance_metrics (date_recorded) VALUES (CURRENT_DATE);

-- ================================
-- COMMENTS AND DOCUMENTATION
-- ================================

COMMENT ON TABLE ai_processing_history IS 'Comprehensive tracking of AI-enhanced guidance processing with detailed metrics and results';
COMMENT ON TABLE recommendation_analytics IS 'Analytics for real-time recommendation generation and user interaction tracking';
COMMENT ON TABLE category_processing_specs IS 'Category-specific processing specifications and performance tracking';
COMMENT ON TABLE content_enhancement_logs IS 'Detailed logging of content enhancement operations and effectiveness';
COMMENT ON TABLE framework_alignment_tracking IS 'Framework alignment analysis and improvement tracking';
COMMENT ON TABLE ai_performance_metrics IS 'Daily aggregated AI processing performance and quality metrics';

COMMENT ON COLUMN ai_processing_history.processing_method IS 'Method used: category-specific (optimized), ai-enhanced (general AI), standard-rag (basic RAG), rule-based (fallback)';
COMMENT ON COLUMN recommendation_analytics.recommendation_types IS 'Types of recommendations generated: content-enhancement, framework-alignment, quality-improvement, etc.';
COMMENT ON COLUMN category_processing_specs.sub_sections IS 'JSON array of sub-section specifications with constraints and priority levels';
COMMENT ON COLUMN content_enhancement_logs.enhancement_type IS 'Type of enhancement applied: length_optimization, quality_improvement, framework_alignment, etc.';

-- Migration completion
SELECT 'AI Processing Enhancements database schema created successfully' AS status;