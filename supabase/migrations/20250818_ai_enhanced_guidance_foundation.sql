-- AI-Enhanced Unified Guidance Foundation
-- Phase 1: Database schema for AI-enhanced content lifecycle
-- NON-BREAKING: All existing functionality preserved

-- =============================================================================
-- 1. GUIDANCE VERSIONS - Immutable Content Versioning
-- =============================================================================

CREATE TABLE guidance_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unified_requirement_id UUID NOT NULL REFERENCES unified_requirements(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    
    -- Content Structure
    content_blocks JSONB NOT NULL DEFAULT '[]', -- Array of GuidanceBlock objects
    framework_conditions JSONB DEFAULT '{}', -- Which frameworks show each block
    
    -- Workflow State
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
    workflow_stage TEXT NOT NULL DEFAULT 'editing' CHECK (workflow_stage IN ('editing', 'review', 'approval', 'publishing')),
    
    -- Quality Metrics  
    content_hash TEXT NOT NULL,
    word_count INTEGER DEFAULT 0,
    row_count INTEGER DEFAULT 0, -- Enforce 8-10 row limit
    lint_score DECIMAL(3,2) DEFAULT 0.0 CHECK (lint_score >= 0.0 AND lint_score <= 1.0),
    readability_score DECIMAL(3,2) DEFAULT 0.0 CHECK (readability_score >= 0.0 AND readability_score <= 1.0),
    
    -- Audit & Governance
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    approved_by UUID, 
    approved_at TIMESTAMPTZ,
    published_by UUID,
    published_at TIMESTAMPTZ,
    scheduled_publish_at TIMESTAMPTZ,
    
    -- AI Enhancement Tracking
    ai_suggestions_count INTEGER DEFAULT 0,
    ai_approved_count INTEGER DEFAULT 0,
    ai_confidence_avg DECIMAL(3,2) DEFAULT 0.0 CHECK (ai_confidence_avg >= 0.0 AND ai_confidence_avg <= 1.0),
    last_ai_enhancement TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    UNIQUE(unified_requirement_id, version_number),
    
    -- Validation constraints
    CONSTRAINT valid_approval_sequence CHECK (
        (approved_at IS NULL) OR (reviewed_at IS NOT NULL)
    ),
    CONSTRAINT valid_publish_sequence CHECK (
        (published_at IS NULL) OR (approved_at IS NOT NULL)
    )
);

-- Indexes for performance
CREATE INDEX idx_guidance_versions_requirement ON guidance_versions(unified_requirement_id);
CREATE INDEX idx_guidance_versions_status ON guidance_versions(status);
CREATE INDEX idx_guidance_versions_published ON guidance_versions(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_guidance_versions_workflow ON guidance_versions(workflow_stage, status);

-- =============================================================================
-- 2. GUIDANCE BLOCKS - Structured Content Components
-- =============================================================================

CREATE TABLE guidance_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL REFERENCES guidance_versions(id) ON DELETE CASCADE,
    
    -- Block Structure
    block_type TEXT NOT NULL CHECK (block_type IN ('intro', 'baseline', 'conditional', 'operational_excellence')),
    block_order INTEGER NOT NULL,
    sub_requirement_letter TEXT, -- a, b, c, etc.
    
    -- Content
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    
    -- Framework Conditions
    framework_conditions JSONB DEFAULT '{}', -- {iso27001: true, gdpr: false}
    
    -- Citations & Sources
    citations JSONB DEFAULT '[]', -- Array of citation objects
    
    -- Quality Control
    lint_violations JSONB DEFAULT '[]',
    style_score DECIMAL(3,2) DEFAULT 1.0 CHECK (style_score >= 0.0 AND style_score <= 1.0),
    
    -- AI Metadata
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(3,2) CHECK (ai_confidence IS NULL OR (ai_confidence >= 0.0 AND ai_confidence <= 1.0)),
    ai_rationale TEXT,
    ai_model_version TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(version_id, block_order)
);

-- Indexes
CREATE INDEX idx_guidance_blocks_version ON guidance_blocks(version_id);
CREATE INDEX idx_guidance_blocks_type ON guidance_blocks(block_type);
CREATE INDEX idx_guidance_blocks_subreq ON guidance_blocks(sub_requirement_letter) WHERE sub_requirement_letter IS NOT NULL;
CREATE INDEX idx_guidance_blocks_ai ON guidance_blocks(ai_generated, ai_confidence) WHERE ai_generated = TRUE;

-- =============================================================================
-- 3. AI SUGGESTIONS - AI Enhancement Pipeline
-- =============================================================================

CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unified_requirement_id UUID NOT NULL REFERENCES unified_requirements(id),
    target_version_id UUID NOT NULL REFERENCES guidance_versions(id) ON DELETE CASCADE,
    
    -- Suggestion Details
    suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('addition', 'replacement', 'enhancement', 'compression')),
    target_block_id UUID REFERENCES guidance_blocks(id), -- NULL for new blocks
    
    -- Content
    original_content TEXT, -- Current content being changed
    suggested_content TEXT NOT NULL,
    rationale TEXT NOT NULL,
    
    -- AI Scoring
    confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    impact_label TEXT NOT NULL CHECK (impact_label IN ('clarity', 'completeness', 'duplication_reduction', 'compliance', 'style')),
    
    -- Citations (mandatory for AI suggestions)
    citations JSONB NOT NULL DEFAULT '[]',
    source_chunks UUID[] NOT NULL, -- Links to knowledge_content.id
    
    -- Review State
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'superseded')),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT,
    
    -- Processing Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_ai_model TEXT DEFAULT 'gemini-pro',
    processing_time_ms INTEGER,
    token_usage JSONB DEFAULT '{}',
    
    -- Validation: AI suggestions must have citations
    CONSTRAINT ai_suggestions_citations_required CHECK (
        (ai_generated = FALSE) OR (jsonb_array_length(citations) > 0 AND array_length(source_chunks, 1) > 0)
    )
);

-- Indexes
CREATE INDEX idx_ai_suggestions_requirement ON ai_suggestions(unified_requirement_id);
CREATE INDEX idx_ai_suggestions_version ON ai_suggestions(target_version_id);
CREATE INDEX idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX idx_ai_suggestions_confidence ON ai_suggestions(confidence_score DESC);
CREATE INDEX idx_ai_suggestions_pending ON ai_suggestions(created_at DESC) WHERE status = 'pending';

-- =============================================================================
-- 4. CITATIONS - Source Attribution
-- =============================================================================

CREATE TABLE citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What is being cited (either block or suggestion)
    block_id UUID REFERENCES guidance_blocks(id) ON DELETE CASCADE,
    suggestion_id UUID REFERENCES ai_suggestions(id) ON DELETE CASCADE,
    
    -- Source reference
    knowledge_content_id UUID NOT NULL REFERENCES knowledge_content(id),
    
    -- Citation details
    citation_text TEXT NOT NULL,
    page_number INTEGER,
    section_reference TEXT,
    relevance_score DECIMAL(3,2) DEFAULT 1.0 CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
    
    -- Context
    context_before TEXT,
    context_after TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    
    -- Constraint: Must cite either a block or suggestion
    CONSTRAINT citations_source_check CHECK (
        (block_id IS NOT NULL AND suggestion_id IS NULL) OR 
        (block_id IS NULL AND suggestion_id IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX idx_citations_block ON citations(block_id) WHERE block_id IS NOT NULL;
CREATE INDEX idx_citations_suggestion ON citations(suggestion_id) WHERE suggestion_id IS NOT NULL;
CREATE INDEX idx_citations_knowledge ON citations(knowledge_content_id);
CREATE INDEX idx_citations_relevance ON citations(relevance_score DESC);

-- =============================================================================
-- 5. WORKFLOW TRANSITIONS - Complete Audit Trail
-- =============================================================================

CREATE TABLE workflow_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL REFERENCES guidance_versions(id) ON DELETE CASCADE,
    
    -- Transition Details  
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    from_stage TEXT NOT NULL,
    to_stage TEXT NOT NULL,
    
    -- Actor & Context
    actor_id UUID NOT NULL,
    actor_role TEXT NOT NULL CHECK (actor_role IN ('editor', 'reviewer', 'publisher', 'admin', 'system')),
    
    -- Change Details
    change_summary TEXT NOT NULL,
    rationale TEXT,
    blocks_affected INTEGER DEFAULT 0,
    suggestions_processed INTEGER DEFAULT 0,
    
    -- Metadata
    transition_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT
);

-- Indexes
CREATE INDEX idx_workflow_transitions_version ON workflow_transitions(version_id);
CREATE INDEX idx_workflow_transitions_actor ON workflow_transitions(actor_id);
CREATE INDEX idx_workflow_transitions_time ON workflow_transitions(transition_at DESC);
CREATE INDEX idx_workflow_transitions_status ON workflow_transitions(from_status, to_status);

-- =============================================================================
-- 6. EXTEND KNOWLEDGE SOURCES - Enhanced Governance
-- =============================================================================

-- Add governance fields to existing knowledge_sources table
ALTER TABLE knowledge_sources 
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS license_note TEXT,
ADD COLUMN IF NOT EXISTS robots_compliance BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'url' CHECK (source_type IN ('url', 'file', 'sharepoint', 'paste')),
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('public', 'internal', 'restricted')),
ADD COLUMN IF NOT EXISTS governance_notes JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS checksum TEXT;

-- Add deduplication index
CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_sources_canonical 
ON knowledge_sources(canonical_url) WHERE canonical_url IS NOT NULL;

-- Index for governance queries
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_governance 
ON knowledge_sources(source_type, visibility, status);

-- =============================================================================
-- 7. INITIAL DATA MIGRATION - Preserve Existing Content
-- =============================================================================

-- Create published versions for all existing unified requirements
-- This ensures zero breaking changes to current system
INSERT INTO guidance_versions (
    unified_requirement_id,
    version_number,
    content_blocks,
    framework_conditions,
    status,
    workflow_stage,
    content_hash,
    word_count,
    row_count,
    created_by,
    created_at,
    published_by,
    published_at
)
SELECT 
    ur.id as unified_requirement_id,
    1 as version_number,
    jsonb_build_array(
        jsonb_build_object(
            'type', 'intro',
            'order', 0,
            'content', COALESCE(ur.description, 'Baseline requirement content'),
            'subrequirements', ur.sub_requirements,
            'ai_generated', false
        )
    ) as content_blocks,
    jsonb_build_object(
        'iso27001', true,
        'iso27002', true,
        'cisControls', true,
        'gdpr', true,
        'nis2', true
    ) as framework_conditions,
    'published' as status,
    'publishing' as workflow_stage,
    md5(ur.description || array_to_string(ur.sub_requirements, '')) as content_hash,
    array_length(string_to_array(ur.description, ' '), 1) as word_count,
    array_length(ur.sub_requirements, 1) + 1 as row_count,
    COALESCE(ur.created_by, '00000000-0000-0000-0000-000000000000'::UUID) as created_by,
    ur.created_at,
    COALESCE(ur.created_by, '00000000-0000-0000-0000-000000000000'::UUID) as published_by,
    ur.created_at as published_at
FROM unified_requirements ur
WHERE ur.is_active = TRUE;

-- =============================================================================
-- 8. HELPER FUNCTIONS
-- =============================================================================

-- Function to get latest published guidance version
CREATE OR REPLACE FUNCTION get_latest_published_guidance(requirement_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id 
        FROM guidance_versions 
        WHERE unified_requirement_id = requirement_id 
          AND status = 'published'
        ORDER BY version_number DESC
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update guidance version metadata
CREATE OR REPLACE FUNCTION update_version_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update word count and row count when content_blocks change
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.content_blocks IS DISTINCT FROM NEW.content_blocks) THEN
        NEW.word_count := (
            SELECT SUM(array_length(string_to_array(block->>'content', ' '), 1))
            FROM jsonb_array_elements(NEW.content_blocks) AS block
        );
        NEW.row_count := jsonb_array_length(NEW.content_blocks);
        NEW.content_hash := md5(NEW.content_blocks::text);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update version stats
CREATE TRIGGER trigger_update_version_stats
    BEFORE INSERT OR UPDATE ON guidance_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_version_stats();

-- =============================================================================
-- 9. SECURITY & RBAC
-- =============================================================================

-- Row Level Security policies will be added in Phase 2
-- For now, rely on application-level security

-- Comments for documentation
COMMENT ON TABLE guidance_versions IS 'Immutable versioned guidance content with workflow state management';
COMMENT ON TABLE guidance_blocks IS 'Individual content blocks within guidance versions';
COMMENT ON TABLE ai_suggestions IS 'AI-generated content enhancement suggestions with mandatory citations';
COMMENT ON TABLE citations IS 'Source attribution for all AI-generated content';
COMMENT ON TABLE workflow_transitions IS 'Complete audit trail of all guidance workflow changes';

-- =============================================================================
-- 10. VERIFICATION QUERIES
-- =============================================================================

-- Verify migration success
DO $$
DECLARE
    v_requirements_count INTEGER;
    v_versions_count INTEGER;
    v_categories_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_requirements_count FROM unified_requirements WHERE is_active = TRUE;
    SELECT COUNT(*) INTO v_versions_count FROM guidance_versions WHERE status = 'published';
    SELECT COUNT(*) INTO v_categories_count FROM unified_compliance_categories WHERE is_active = TRUE;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE 'Active Requirements: %', v_requirements_count;
    RAISE NOTICE 'Published Versions Created: %', v_versions_count;
    RAISE NOTICE 'Active Categories: %', v_categories_count;
    
    IF v_requirements_count = v_versions_count THEN
        RAISE NOTICE '✅ Migration successful - all requirements have published versions';
    ELSE
        RAISE NOTICE '⚠️ Migration verification failed - counts do not match';
    END IF;
END $$;

-- Show sample migrated data
SELECT 
    ur.title as requirement_title,
    ucc.name as category_name,
    gv.version_number,
    gv.status,
    gv.word_count,
    gv.row_count
FROM guidance_versions gv
JOIN unified_requirements ur ON gv.unified_requirement_id = ur.id
JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
ORDER BY ucc.sort_order, ur.sort_order
LIMIT 5;