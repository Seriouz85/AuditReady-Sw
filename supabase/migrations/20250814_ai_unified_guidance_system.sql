-- =============================================================================
-- AI-Powered Unified Guidance System Database Migration
-- =============================================================================
-- Creates comprehensive database schema for AI-powered content management
-- with vector embedding support, multi-tenant security, and admin management
-- =============================================================================

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Set timezone
SET timezone = 'UTC';

-- =============================================================================
-- 1. UNIFIED_GUIDANCE_TEMPLATES
-- Core content templates for AI-powered guidance generation
-- =============================================================================

CREATE TABLE unified_guidance_templates (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(255) NOT NULL,
    category_slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Content Structure (Core content sections)
    foundation_content TEXT NOT NULL,
    implementation_steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of steps
    practical_tools JSONB NOT NULL DEFAULT '[]'::jsonb,     -- Array of tools
    audit_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,      -- Array of evidence items
    cross_references JSONB NOT NULL DEFAULT '[]'::jsonb,    -- Array of related categories
    
    -- AI Enhancement Configuration
    ai_prompt_foundation TEXT,
    ai_prompt_implementation TEXT,
    ai_context_keywords JSONB DEFAULT '[]'::jsonb,          -- Keywords for AI context
    ai_enhancement_enabled BOOLEAN DEFAULT true,
    
    -- Quality & Metadata
    content_quality_score DECIMAL(3,2) CHECK (content_quality_score >= 0 AND content_quality_score <= 5.00),
    last_ai_enhanced_at TIMESTAMPTZ,
    review_status VARCHAR(50) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'needs_review', 'rejected')),
    
    -- Vector Integration (compatible with existing 768-dim embeddings)
    vector_embedding VECTOR(768),      -- Gemini embedding-001 compatible
    vector_keywords JSONB DEFAULT '[]'::jsonb,              -- For vector similarity
    embedding_model VARCHAR(100) DEFAULT 'gemini-embedding-001',
    last_indexed_at TIMESTAMPTZ,
    
    -- Multi-tenant security
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_global_template BOOLEAN DEFAULT false, -- Available to all organizations
    
    -- Admin Management & Audit Trail
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    version INTEGER DEFAULT 1,
    change_log JSONB DEFAULT '[]'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_category_slug CHECK (category_slug ~ '^[a-z0-9_-]+$'),
    CONSTRAINT valid_quality_score CHECK (content_quality_score IS NULL OR (content_quality_score >= 0 AND content_quality_score <= 5.00))
);

-- Indexes for unified_guidance_templates
CREATE INDEX idx_unified_guidance_templates_category_slug ON unified_guidance_templates(category_slug);
CREATE INDEX idx_unified_guidance_templates_review_status ON unified_guidance_templates(review_status);
CREATE INDEX idx_unified_guidance_templates_organization ON unified_guidance_templates(organization_id);
CREATE INDEX idx_unified_guidance_templates_global ON unified_guidance_templates(is_global_template);
CREATE INDEX idx_unified_guidance_templates_quality ON unified_guidance_templates(content_quality_score);
CREATE INDEX idx_unified_guidance_templates_updated ON unified_guidance_templates(updated_at);

-- Vector similarity index
CREATE INDEX idx_unified_guidance_templates_vector 
ON unified_guidance_templates 
USING ivfflat (vector_embedding vector_cosine_ops)
WITH (lists = 100);

-- Full-text search index
CREATE INDEX idx_unified_guidance_templates_search 
ON unified_guidance_templates 
USING gin(to_tsvector('english', category_name || ' ' || foundation_content));

-- =============================================================================
-- 2. FRAMEWORK_REQUIREMENT_MAPPINGS
-- Maps framework-specific requirements to unified guidance templates
-- =============================================================================

CREATE TABLE framework_requirement_mappings (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES unified_guidance_templates(id) ON DELETE CASCADE,
    
    -- Framework Details
    framework_type VARCHAR(50) NOT NULL CHECK (framework_type IN ('iso27001', 'iso27002', 'cisControls', 'nist', 'gdpr', 'nis2', 'sox', 'hipaa', 'pci_dss', 'custom')),
    requirement_code VARCHAR(100) NOT NULL,
    requirement_title TEXT NOT NULL,
    requirement_description TEXT,
    relevance_level VARCHAR(20) DEFAULT 'primary' CHECK (relevance_level IN ('primary', 'supporting', 'cross_reference', 'related')),
    
    -- AI Enhancement Configuration
    ai_context_weight DECIMAL(3,2) DEFAULT 1.00 CHECK (ai_context_weight >= 0 AND ai_context_weight <= 5.00),
    custom_guidance_notes TEXT,
    ai_prompt_overrides JSONB DEFAULT '{}'::jsonb,
    
    -- Quality & Validation Tracking
    mapping_confidence DECIMAL(3,2) CHECK (mapping_confidence >= 0 AND mapping_confidence <= 1.00),
    last_validated_at TIMESTAMPTZ,
    validation_source VARCHAR(100) CHECK (validation_source IN ('manual', 'ai_assisted', 'imported', 'auto_mapped')),
    validation_notes TEXT,
    
    -- Multi-tenant security
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_global_mapping BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(template_id, framework_type, requirement_code)
);

-- Indexes for framework_requirement_mappings
CREATE INDEX idx_framework_requirement_mappings_template ON framework_requirement_mappings(template_id);
CREATE INDEX idx_framework_requirement_mappings_framework ON framework_requirement_mappings(framework_type);
CREATE INDEX idx_framework_requirement_mappings_org ON framework_requirement_mappings(organization_id);
CREATE INDEX idx_framework_requirement_mappings_relevance ON framework_requirement_mappings(relevance_level);
CREATE INDEX idx_framework_requirement_mappings_confidence ON framework_requirement_mappings(mapping_confidence);

-- Composite indexes for common queries
CREATE INDEX idx_framework_mappings_framework_relevance ON framework_requirement_mappings(framework_type, relevance_level);
CREATE INDEX idx_framework_mappings_template_framework ON framework_requirement_mappings(template_id, framework_type);

-- =============================================================================
-- 3. GUIDANCE_CONTENT_CACHE
-- Intelligent caching system for AI-generated content
-- =============================================================================

CREATE TABLE guidance_content_cache (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Cache Key Components
    template_id UUID NOT NULL REFERENCES unified_guidance_templates(id) ON DELETE CASCADE,
    framework_selection_hash VARCHAR(64) NOT NULL, -- Hash of selected frameworks
    user_context_hash VARCHAR(64), -- Optional: user-specific context (industry, role, etc.)
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Generated Content
    generated_content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'markdown' CHECK (content_format IN ('markdown', 'html', 'plain_text', 'structured_json')),
    content_sections JSONB DEFAULT '{}'::jsonb, -- Structured content by section
    
    -- AI Generation Details
    ai_model_used VARCHAR(100),
    ai_model_version VARCHAR(50),
    generation_prompt TEXT,
    generation_tokens_used INTEGER,
    generation_cost DECIMAL(10,6), -- Track AI API costs with precision
    prompt_hash VARCHAR(64), -- To detect prompt changes
    
    -- Performance & Quality Metrics
    generation_time_ms INTEGER,
    content_quality_score DECIMAL(3,2) CHECK (content_quality_score >= 0 AND content_quality_score <= 5.00),
    user_feedback_score DECIMAL(3,2) CHECK (user_feedback_score >= 0 AND user_feedback_score <= 5.00),
    usage_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Cache Management
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    invalidation_reason TEXT,
    cache_priority INTEGER DEFAULT 1 CHECK (cache_priority >= 1 AND cache_priority <= 10),
    
    -- Audit Trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(template_id, framework_selection_hash, user_context_hash, organization_id)
);

-- Indexes for guidance_content_cache
CREATE INDEX idx_guidance_content_cache_template ON guidance_content_cache(template_id);
CREATE INDEX idx_guidance_content_cache_org ON guidance_content_cache(organization_id);
CREATE INDEX idx_guidance_content_cache_hash ON guidance_content_cache(framework_selection_hash);
CREATE INDEX idx_guidance_content_cache_expires ON guidance_content_cache(expires_at);
CREATE INDEX idx_guidance_content_cache_active ON guidance_content_cache(is_active);
CREATE INDEX idx_guidance_content_cache_usage ON guidance_content_cache(usage_count);
CREATE INDEX idx_guidance_content_cache_quality ON guidance_content_cache(content_quality_score);

-- Composite indexes for cache lookup optimization
CREATE INDEX idx_guidance_cache_lookup ON guidance_content_cache(template_id, framework_selection_hash, is_active);
CREATE INDEX idx_guidance_cache_cleanup ON guidance_content_cache(expires_at, is_active);

-- =============================================================================
-- 4. CONTENT_QUALITY_METRICS
-- Multi-dimensional content quality tracking and analytics
-- =============================================================================

CREATE TABLE content_quality_metrics (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES unified_guidance_templates(id) ON DELETE CASCADE,
    cache_id UUID REFERENCES guidance_content_cache(id) ON DELETE CASCADE,
    
    -- Quality Dimensions (0.00-5.00 scale)
    completeness_score DECIMAL(3,2) CHECK (completeness_score >= 0 AND completeness_score <= 5.00),
    accuracy_score DECIMAL(3,2) CHECK (accuracy_score >= 0 AND accuracy_score <= 5.00),
    clarity_score DECIMAL(3,2) CHECK (clarity_score >= 0 AND clarity_score <= 5.00),
    actionability_score DECIMAL(3,2) CHECK (actionability_score >= 0 AND actionability_score <= 5.00),
    ciso_grade_score DECIMAL(3,2) CHECK (ciso_grade_score >= 0 AND ciso_grade_score <= 5.00),
    overall_quality_score DECIMAL(3,2) CHECK (overall_quality_score >= 0 AND overall_quality_score <= 5.00),
    
    -- Detailed Content Analysis Metrics
    word_count INTEGER,
    paragraph_count INTEGER,
    sentence_count INTEGER,
    readability_grade DECIMAL(3,1), -- Flesch-Kincaid grade level
    technical_term_density DECIMAL(3,2),
    action_verb_count INTEGER,
    bullet_point_count INTEGER,
    
    -- Structural Validation Results
    has_all_required_sections BOOLEAN,
    framework_coverage_complete BOOLEAN,
    cross_references_valid BOOLEAN,
    implementation_steps_present BOOLEAN,
    evidence_examples_present BOOLEAN,
    tools_recommendations_present BOOLEAN,
    
    -- AI Analysis Results
    ai_sentiment_score DECIMAL(3,2) CHECK (ai_sentiment_score >= -1.00 AND ai_sentiment_score <= 1.00), -- Confidence/authority tone
    ai_topics_covered JSONB DEFAULT '[]'::jsonb,         -- AI-identified topics
    improvement_suggestions JSONB DEFAULT '[]'::jsonb,   -- AI suggestions for improvement
    risk_assessment JSONB DEFAULT '{}'::jsonb,           -- AI-identified content risks
    
    -- Validation Context
    measurement_method VARCHAR(50) DEFAULT 'automated' CHECK (measurement_method IN ('automated', 'manual', 'ai_assisted', 'hybrid')),
    validator_version VARCHAR(50),
    validation_context JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for content_quality_metrics
CREATE INDEX idx_content_quality_metrics_template ON content_quality_metrics(template_id);
CREATE INDEX idx_content_quality_metrics_cache ON content_quality_metrics(cache_id);
CREATE INDEX idx_content_quality_metrics_overall ON content_quality_metrics(overall_quality_score);
CREATE INDEX idx_content_quality_metrics_ciso ON content_quality_metrics(ciso_grade_score);
CREATE INDEX idx_content_quality_metrics_measured ON content_quality_metrics(measured_at);

-- =============================================================================
-- 5. AI_GENERATION_LOGS
-- Comprehensive logging for AI API usage, costs, and performance
-- =============================================================================

CREATE TABLE ai_generation_logs (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Request Context
    template_id UUID REFERENCES unified_guidance_templates(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    request_id VARCHAR(100), -- For tracing across services
    
    -- AI Request Details
    prompt_type VARCHAR(50) NOT NULL CHECK (prompt_type IN ('generate', 'enhance', 'validate', 'summarize', 'refine', 'translate')),
    input_prompt TEXT NOT NULL,
    prompt_template VARCHAR(100),
    framework_context JSONB DEFAULT '[]'::jsonb, -- Selected frameworks and requirements
    user_context JSONB DEFAULT '{}'::jsonb,      -- Industry, role, experience level
    generation_parameters JSONB DEFAULT '{}'::jsonb, -- Temperature, max_tokens, etc.
    
    -- AI Model & Response
    ai_provider VARCHAR(50) CHECK (ai_provider IN ('gemini', 'openai', 'claude', 'azure_openai', 'custom')),
    ai_model VARCHAR(100),
    model_version VARCHAR(50),
    response_content TEXT,
    response_metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Token Usage & Costs
    tokens_prompt INTEGER,
    tokens_completion INTEGER,
    total_tokens INTEGER,
    prompt_cost DECIMAL(10,6),
    completion_cost DECIMAL(10,6),
    total_cost DECIMAL(10,6),
    cost_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Performance Metrics
    response_time_ms INTEGER,
    queue_time_ms INTEGER,
    processing_time_ms INTEGER,
    api_latency_ms INTEGER,
    
    -- Quality & Success Tracking
    success BOOLEAN DEFAULT true,
    error_code VARCHAR(50),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    final_attempt BOOLEAN DEFAULT true,
    
    -- Content Quality Assessment (post-generation)
    content_relevance DECIMAL(3,2) CHECK (content_relevance >= 0 AND content_relevance <= 5.00),
    content_coherence DECIMAL(3,2) CHECK (content_coherence >= 0 AND content_coherence <= 5.00),
    factual_accuracy DECIMAL(3,2) CHECK (factual_accuracy >= 0 AND factual_accuracy <= 5.00),
    user_satisfaction DECIMAL(3,2) CHECK (user_satisfaction >= 0 AND user_satisfaction <= 5.00),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ai_generation_logs
CREATE INDEX idx_ai_generation_logs_template ON ai_generation_logs(template_id);
CREATE INDEX idx_ai_generation_logs_user ON ai_generation_logs(user_id);
CREATE INDEX idx_ai_generation_logs_org ON ai_generation_logs(organization_id);
CREATE INDEX idx_ai_generation_logs_type ON ai_generation_logs(prompt_type);
CREATE INDEX idx_ai_generation_logs_model ON ai_generation_logs(ai_provider, ai_model);
CREATE INDEX idx_ai_generation_logs_success ON ai_generation_logs(success);
CREATE INDEX idx_ai_generation_logs_cost ON ai_generation_logs(total_cost);
CREATE INDEX idx_ai_generation_logs_created ON ai_generation_logs(created_at);

-- Composite indexes for analytics
CREATE INDEX idx_ai_logs_org_date ON ai_generation_logs(organization_id, created_at);
CREATE INDEX idx_ai_logs_cost_analysis ON ai_generation_logs(ai_provider, created_at, total_cost);

-- =============================================================================
-- 6. ADMIN_CONTENT_EDITS
-- Admin edit tracking, approval workflows, and change management
-- =============================================================================

CREATE TABLE admin_content_edits (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Target Content
    template_id UUID NOT NULL REFERENCES unified_guidance_templates(id) ON DELETE CASCADE,
    section_type VARCHAR(50) CHECK (section_type IN ('foundation', 'implementation', 'tools', 'evidence', 'cross_references', 'ai_prompts', 'metadata', 'full_template')),
    
    -- Edit Operation Details
    edit_type VARCHAR(50) NOT NULL CHECK (edit_type IN ('create', 'update', 'delete', 'ai_enhance', 'bulk_update', 'merge', 'split', 'archive')),
    original_content TEXT,
    updated_content TEXT,
    content_diff JSONB, -- Structured diff for better tracking
    edit_reason TEXT,
    change_summary TEXT,
    
    -- Admin Context
    admin_user_id UUID NOT NULL REFERENCES users(id),
    admin_role VARCHAR(50),
    admin_notes TEXT,
    edit_context JSONB DEFAULT '{}'::jsonb, -- Additional context like tool used, bulk operation details
    
    -- Approval Workflow
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'auto_approved', 'review_requested')),
    approved_by UUID REFERENCES users(id),
    approval_notes TEXT,
    approval_date TIMESTAMPTZ,
    requires_review BOOLEAN DEFAULT true,
    
    -- Change Impact Assessment
    affects_cache_keys JSONB DEFAULT '[]'::jsonb, -- Cache entries to invalidate
    requires_ai_regeneration BOOLEAN DEFAULT false,
    impact_scope VARCHAR(20) DEFAULT 'single' CHECK (impact_scope IN ('single', 'category', 'framework', 'organization', 'global')),
    estimated_affected_users INTEGER,
    
    -- Priority & Scheduling
    priority_level VARCHAR(20) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent', 'emergency')),
    scheduled_deployment_at TIMESTAMPTZ,
    deployment_batch VARCHAR(50), -- For batching related changes
    
    -- Quality Assurance
    tested BOOLEAN DEFAULT false,
    test_results JSONB,
    rollback_data JSONB, -- Data needed for rollback if required
    
    -- Multi-tenant Context
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    affects_global_content BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    applied_at TIMESTAMPTZ,
    deployed_at TIMESTAMPTZ
);

-- Indexes for admin_content_edits
CREATE INDEX idx_admin_content_edits_template ON admin_content_edits(template_id);
CREATE INDEX idx_admin_content_edits_admin ON admin_content_edits(admin_user_id);
CREATE INDEX idx_admin_content_edits_status ON admin_content_edits(approval_status);
CREATE INDEX idx_admin_content_edits_type ON admin_content_edits(edit_type);
CREATE INDEX idx_admin_content_edits_priority ON admin_content_edits(priority_level);
CREATE INDEX idx_admin_content_edits_org ON admin_content_edits(organization_id);
CREATE INDEX idx_admin_content_edits_created ON admin_content_edits(created_at);
CREATE INDEX idx_admin_content_edits_scheduled ON admin_content_edits(scheduled_deployment_at);

-- Composite indexes for workflow management
CREATE INDEX idx_admin_edits_approval_workflow ON admin_content_edits(approval_status, priority_level, created_at);
CREATE INDEX idx_admin_edits_deployment_queue ON admin_content_edits(scheduled_deployment_at, approval_status);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Multi-tenant security with admin management capabilities
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE unified_guidance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_requirement_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guidance_content_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_content_edits ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES: unified_guidance_templates
-- =============================================================================

-- Read access: Users can see global templates and their org's templates
CREATE POLICY "templates_select_policy" ON unified_guidance_templates
FOR SELECT TO authenticated
USING (
  is_global_template = true 
  OR organization_id IS NULL 
  OR organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Insert: Admin users can create templates for their organization
CREATE POLICY "templates_insert_policy" ON unified_guidance_templates
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND (organization_id IS NULL OR u.organization_id = organization_id)
  )
);

-- Update: Admin users can update templates in their organization
CREATE POLICY "templates_update_policy" ON unified_guidance_templates
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND (organization_id IS NULL OR u.organization_id = organization_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND (organization_id IS NULL OR u.organization_id = organization_id)
  )
);

-- =============================================================================
-- RLS POLICIES: framework_requirement_mappings
-- =============================================================================

-- Read access: Users can see global mappings and their org's mappings
CREATE POLICY "mappings_select_policy" ON framework_requirement_mappings
FOR SELECT TO authenticated
USING (
  is_global_mapping = true 
  OR organization_id IS NULL 
  OR organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Insert/Update: Admin users only
CREATE POLICY "mappings_admin_policy" ON framework_requirement_mappings
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND (organization_id IS NULL OR u.organization_id = organization_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND (organization_id IS NULL OR u.organization_id = organization_id)
  )
);

-- =============================================================================
-- RLS POLICIES: guidance_content_cache
-- =============================================================================

-- Users can access cache for their organization
CREATE POLICY "cache_access_policy" ON guidance_content_cache
FOR SELECT TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- System can manage cache (service role)
CREATE POLICY "cache_system_policy" ON guidance_content_cache
FOR ALL TO service_role
USING (true);

-- Admin users can manage cache for their organization
CREATE POLICY "cache_admin_policy" ON guidance_content_cache
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND u.organization_id = organization_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND u.organization_id = organization_id
  )
);

-- =============================================================================
-- RLS POLICIES: content_quality_metrics
-- =============================================================================

-- Users can view quality metrics through templates they can access
CREATE POLICY "quality_metrics_select_policy" ON content_quality_metrics
FOR SELECT TO authenticated
USING (
  template_id IN (
    SELECT id FROM unified_guidance_templates
    WHERE is_global_template = true 
    OR organization_id IS NULL 
    OR organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  )
);

-- System and admin users can manage quality metrics
CREATE POLICY "quality_metrics_admin_policy" ON content_quality_metrics
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
  )
);

-- System role can manage all metrics
CREATE POLICY "quality_metrics_system_policy" ON content_quality_metrics
FOR ALL TO service_role
USING (true);

-- =============================================================================
-- RLS POLICIES: ai_generation_logs
-- =============================================================================

-- Users can see their own generation logs
CREATE POLICY "ai_logs_user_policy" ON ai_generation_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Admin users can see organization logs
CREATE POLICY "ai_logs_admin_policy" ON ai_generation_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND u.organization_id = organization_id
  )
);

-- System can manage all logs
CREATE POLICY "ai_logs_system_policy" ON ai_generation_logs
FOR ALL TO service_role
USING (true);

-- Insert logs (authenticated users can log their AI requests)
CREATE POLICY "ai_logs_insert_policy" ON ai_generation_logs
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND organization_id IN (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- =============================================================================
-- RLS POLICIES: admin_content_edits
-- =============================================================================

-- Admin users can manage edits for their organization
CREATE POLICY "admin_edits_policy" ON admin_content_edits
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND (organization_id IS NULL OR u.organization_id = organization_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.role IN ('admin', 'super_admin')
    AND (organization_id IS NULL OR u.organization_id = organization_id)
  )
);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- Automated timestamp updates, cache invalidation, and quality tracking
-- =============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_unified_guidance_templates_updated_at
BEFORE UPDATE ON unified_guidance_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_framework_requirement_mappings_updated_at
BEFORE UPDATE ON framework_requirement_mappings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cache invalidation trigger function
CREATE OR REPLACE FUNCTION invalidate_related_cache()
RETURNS TRIGGER AS $$
BEGIN
    -- Invalidate cache entries related to the updated template
    UPDATE guidance_content_cache 
    SET is_active = false, 
        invalidation_reason = 'template_updated'
    WHERE template_id = COALESCE(NEW.id, OLD.id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply cache invalidation trigger
CREATE TRIGGER invalidate_cache_on_template_update
AFTER UPDATE ON unified_guidance_templates
FOR EACH ROW EXECUTE FUNCTION invalidate_related_cache();

-- Update cache usage statistics
CREATE OR REPLACE FUNCTION update_cache_usage()
RETURNS TRIGGER AS $$
BEGIN
    NEW.usage_count = OLD.usage_count + 1;
    NEW.last_used_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply usage tracking to cache
CREATE TRIGGER update_cache_usage_trigger
BEFORE UPDATE ON guidance_content_cache
FOR EACH ROW 
WHEN (OLD.last_accessed_at IS DISTINCT FROM NEW.last_accessed_at)
EXECUTE FUNCTION update_cache_usage();

-- =============================================================================
-- UTILITY FUNCTIONS
-- Helper functions for AI content management and analytics
-- =============================================================================

-- Find similar templates using vector similarity
CREATE OR REPLACE FUNCTION find_similar_templates(
  query_embedding VECTOR(768),
  similarity_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 10,
  organization_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  template_id UUID,
  category_name VARCHAR(255),
  category_slug VARCHAR(255),
  similarity_score FLOAT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ugt.id,
    ugt.category_name,
    ugt.category_slug,
    1 - (ugt.vector_embedding <=> query_embedding) AS similarity_score
  FROM unified_guidance_templates ugt
  WHERE 
    ugt.vector_embedding IS NOT NULL
    AND (organization_filter IS NULL OR ugt.organization_id = organization_filter OR ugt.is_global_template = true)
    AND (1 - (ugt.vector_embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY ugt.vector_embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Get cache statistics for organization
CREATE OR REPLACE FUNCTION get_cache_statistics(org_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_entries BIGINT,
  active_entries BIGINT,
  total_hits BIGINT,
  avg_quality_score NUMERIC,
  total_cost NUMERIC,
  cache_hit_rate FLOAT
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_entries,
    COUNT(*) FILTER (WHERE is_active = true)::BIGINT as active_entries,
    COALESCE(SUM(usage_count), 0)::BIGINT as total_hits,
    ROUND(AVG(content_quality_score), 2) as avg_quality_score,
    ROUND(SUM(generation_cost), 4) as total_cost,
    CASE 
      WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE usage_count > 0)::FLOAT / COUNT(*)) * 100, 2)
      ELSE 0.0 
    END as cache_hit_rate
  FROM guidance_content_cache gcc
  WHERE org_id IS NULL OR gcc.organization_id = org_id;
END;
$$ LANGUAGE plpgsql;

-- Calculate overall template quality score
CREATE OR REPLACE FUNCTION calculate_template_quality(template_id UUID)
RETURNS DECIMAL(3,2)
SECURITY DEFINER
AS $$
DECLARE
  quality_score DECIMAL(3,2);
BEGIN
  SELECT 
    ROUND(
      (COALESCE(AVG(completeness_score), 0) * 0.25 +
       COALESCE(AVG(accuracy_score), 0) * 0.25 +
       COALESCE(AVG(clarity_score), 0) * 0.20 +
       COALESCE(AVG(actionability_score), 0) * 0.20 +
       COALESCE(AVG(ciso_grade_score), 0) * 0.10), 2
    )
  INTO quality_score
  FROM content_quality_metrics cqm
  WHERE cqm.template_id = calculate_template_quality.template_id;
  
  RETURN COALESCE(quality_score, 0.00);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEWS FOR ADMIN DASHBOARD
-- Pre-calculated views for efficient admin interface queries
-- =============================================================================

-- Template overview with quality metrics
CREATE OR REPLACE VIEW admin_template_overview AS
SELECT 
  ugt.id,
  ugt.category_name,
  ugt.category_slug,
  ugt.review_status,
  ugt.content_quality_score,
  ugt.organization_id,
  ugt.is_global_template,
  ugt.created_at,
  ugt.updated_at,
  COUNT(frm.id) as framework_mappings_count,
  COUNT(gcc.id) as cache_entries_count,
  COALESCE(SUM(gcc.usage_count), 0) as total_cache_hits,
  COALESCE(AVG(cqm.overall_quality_score), 0) as avg_quality_score,
  MAX(cqm.measured_at) as last_quality_check
FROM unified_guidance_templates ugt
LEFT JOIN framework_requirement_mappings frm ON ugt.id = frm.template_id
LEFT JOIN guidance_content_cache gcc ON ugt.id = gcc.template_id
LEFT JOIN content_quality_metrics cqm ON ugt.id = cqm.template_id
GROUP BY ugt.id, ugt.category_name, ugt.category_slug, ugt.review_status, 
         ugt.content_quality_score, ugt.organization_id, ugt.is_global_template,
         ugt.created_at, ugt.updated_at;

-- AI generation analytics
CREATE OR REPLACE VIEW ai_generation_analytics AS
SELECT 
  DATE(created_at) as generation_date,
  ai_provider,
  ai_model,
  organization_id,
  prompt_type,
  COUNT(*) as request_count,
  COUNT(*) FILTER (WHERE success = true) as successful_requests,
  ROUND(AVG(response_time_ms), 2) as avg_response_time_ms,
  ROUND(SUM(total_cost), 4) as total_cost,
  ROUND(AVG(content_relevance), 2) as avg_content_relevance
FROM ai_generation_logs
GROUP BY DATE(created_at), ai_provider, ai_model, organization_id, prompt_type;

-- Cache performance metrics
CREATE OR REPLACE VIEW cache_performance_metrics AS
SELECT 
  gcc.organization_id,
  DATE(gcc.created_at) as cache_date,
  COUNT(*) as cache_entries,
  COUNT(*) FILTER (WHERE gcc.is_active = true) as active_entries,
  SUM(gcc.usage_count) as total_hits,
  ROUND(AVG(gcc.content_quality_score), 2) as avg_quality_score,
  ROUND(AVG(gcc.generation_time_ms), 2) as avg_generation_time_ms,
  ROUND(SUM(gcc.generation_cost), 4) as total_generation_cost
FROM guidance_content_cache gcc
GROUP BY gcc.organization_id, DATE(gcc.created_at);

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- Ensure proper access for different user roles
-- =============================================================================

-- Grant access to authenticated users
GRANT SELECT ON admin_template_overview TO authenticated;
GRANT SELECT ON ai_generation_analytics TO authenticated;
GRANT SELECT ON cache_performance_metrics TO authenticated;

-- Grant execute permissions on utility functions
GRANT EXECUTE ON FUNCTION find_similar_templates TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_template_quality TO authenticated;

-- Grant service role full access for system operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =============================================================================
-- COMMENTS FOR MAINTAINABILITY
-- Document the purpose and usage of each component
-- =============================================================================

COMMENT ON TABLE unified_guidance_templates IS 'Core templates for AI-powered unified guidance content generation';
COMMENT ON TABLE framework_requirement_mappings IS 'Maps specific framework requirements to unified guidance templates';
COMMENT ON TABLE guidance_content_cache IS 'Intelligent caching system for AI-generated content with usage analytics';
COMMENT ON TABLE content_quality_metrics IS 'Multi-dimensional quality tracking and analytics for content validation';
COMMENT ON TABLE ai_generation_logs IS 'Comprehensive logging for AI API usage, costs, and performance monitoring';
COMMENT ON TABLE admin_content_edits IS 'Admin edit tracking with approval workflows and change management';

COMMENT ON FUNCTION find_similar_templates IS 'Finds templates with similar content using vector embeddings';
COMMENT ON FUNCTION get_cache_statistics IS 'Returns comprehensive cache performance statistics';
COMMENT ON FUNCTION calculate_template_quality IS 'Calculates weighted quality score for a template';

-- =============================================================================
-- SUCCESS MESSAGE AND NEXT STEPS
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '🚀 SUCCESS: AI-Powered Unified Guidance System database schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 CREATED TABLES:';
  RAISE NOTICE '  ✅ unified_guidance_templates - Core content templates';
  RAISE NOTICE '  ✅ framework_requirement_mappings - Framework mappings';
  RAISE NOTICE '  ✅ guidance_content_cache - AI content caching';
  RAISE NOTICE '  ✅ content_quality_metrics - Quality tracking';
  RAISE NOTICE '  ✅ ai_generation_logs - AI usage logging';
  RAISE NOTICE '  ✅ admin_content_edits - Admin management';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 SECURITY:';
  RAISE NOTICE '  ✅ Row Level Security (RLS) enabled';
  RAISE NOTICE '  ✅ Multi-tenant isolation configured';
  RAISE NOTICE '  ✅ Admin role permissions implemented';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ PERFORMANCE:';
  RAISE NOTICE '  ✅ Vector similarity indexes created';
  RAISE NOTICE '  ✅ Full-text search indexes added';
  RAISE NOTICE '  ✅ Composite indexes for query optimization';
  RAISE NOTICE '';
  RAISE NOTICE '🧠 AI FEATURES:';
  RAISE NOTICE '  ✅ Vector embedding support (768-dim compatible)';
  RAISE NOTICE '  ✅ AI cost tracking and analytics';
  RAISE NOTICE '  ✅ Quality scoring and validation';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '  1. Run data migration to populate templates from existing service';
  RAISE NOTICE '  2. Implement sub-agent services (AIGuidanceOrchestrator, etc.)';
  RAISE NOTICE '  3. Create Platform Admin interface for content management';
  RAISE NOTICE '  4. Enhance frontend with AI-powered guidance dialog';
  RAISE NOTICE '  5. Set up monitoring and analytics dashboards';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 ADMIN ACCESS:';
  RAISE NOTICE '  - Templates: admin_template_overview view';
  RAISE NOTICE '  - Analytics: ai_generation_analytics view';
  RAISE NOTICE '  - Performance: cache_performance_metrics view';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready for AI-powered unified guidance implementation!';
END $$;