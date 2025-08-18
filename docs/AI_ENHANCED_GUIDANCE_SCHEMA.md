# AI-Enhanced Unified Guidance - Database Schema Design

## 🎯 Overview

This schema extends the existing unified guidance system with AI-enhanced content lifecycle management: **discover → inject → enhance → approve → publish**.

## 📊 Current Architecture Analysis

Your existing foundation is excellent:
- ✅ `unified_compliance_categories` (36 categories) - Perfect master list
- ✅ `unified_requirements` with `sub_requirements` array - Maps to a), b), c) structure  
- ✅ `knowledge_sources` & `knowledge_content` - RAG knowledge base ready
- ✅ Audit trails via `created_by`, `updated_at` - Governance foundation

## 🏗️ New Tables Schema

### 1. **guidance_versions** - Immutable Content Versioning
```sql
CREATE TABLE guidance_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unified_requirement_id UUID NOT NULL REFERENCES unified_requirements(id),
    version_number INTEGER NOT NULL,
    
    -- Content Structure
    content_blocks JSONB NOT NULL, -- Array of GuidanceBlock objects
    framework_conditions JSONB DEFAULT '{}', -- Which frameworks show each block
    
    -- Workflow State
    status TEXT NOT NULL DEFAULT 'draft', -- draft | in_review | approved | published | archived
    workflow_stage TEXT NOT NULL DEFAULT 'editing', -- editing | review | approval | publishing
    
    -- Quality Metrics  
    content_hash TEXT NOT NULL, -- Detect changes
    word_count INTEGER DEFAULT 0,
    row_count INTEGER DEFAULT 0, -- Enforce 8-10 row limit
    lint_score DECIMAL(3,2) DEFAULT 0.0, -- Style compliance 0-1
    readability_score DECIMAL(3,2) DEFAULT 0.0,
    
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
    ai_confidence_avg DECIMAL(3,2) DEFAULT 0.0,
    last_ai_enhancement TIMESTAMPTZ,
    
    UNIQUE(unified_requirement_id, version_number)
);
```

### 2. **guidance_blocks** - Structured Content Components  
```sql
CREATE TABLE guidance_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL REFERENCES guidance_versions(id) ON DELETE CASCADE,
    
    -- Block Structure
    block_type TEXT NOT NULL, -- intro | baseline | conditional | operational_excellence
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
    style_score DECIMAL(3,2) DEFAULT 1.0,
    
    -- AI Metadata
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(3,2),
    ai_rationale TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. **ai_suggestions** - AI Enhancement Pipeline
```sql
CREATE TABLE ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unified_requirement_id UUID NOT NULL REFERENCES unified_requirements(id),
    target_version_id UUID NOT NULL REFERENCES guidance_versions(id),
    
    -- Suggestion Details
    suggestion_type TEXT NOT NULL, -- addition | replacement | enhancement | compression
    target_block_id UUID REFERENCES guidance_blocks(id), -- NULL for new blocks
    
    -- Content
    original_content TEXT, -- Current content being changed
    suggested_content TEXT NOT NULL,
    rationale TEXT NOT NULL,
    
    -- AI Scoring
    confidence_score DECIMAL(3,2) NOT NULL, -- 0.0 - 1.0
    impact_label TEXT NOT NULL, -- clarity | completeness | duplication_reduction | compliance
    
    -- Citations (mandatory)
    citations JSONB NOT NULL DEFAULT '[]', -- Source chunks that support this suggestion
    source_chunks UUID[] NOT NULL, -- Links to knowledge_content.id
    
    -- Review State
    status TEXT DEFAULT 'pending', -- pending | approved | rejected | superseded
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    reviewer_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_ai_model TEXT DEFAULT 'gemini-pro', -- Track which model
    processing_time_ms INTEGER,
    token_usage JSONB DEFAULT '{}' -- Track costs
);
```

### 4. **citations** - Source Attribution
```sql  
CREATE TABLE citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- What is being cited
    block_id UUID REFERENCES guidance_blocks(id) ON DELETE CASCADE,
    suggestion_id UUID REFERENCES ai_suggestions(id) ON DELETE CASCADE,
    
    -- Source reference
    knowledge_content_id UUID NOT NULL REFERENCES knowledge_content(id),
    
    -- Citation details
    citation_text TEXT NOT NULL, -- Actual text being cited
    page_number INTEGER, -- For PDF sources
    section_reference TEXT, -- For structured documents
    relevance_score DECIMAL(3,2) DEFAULT 1.0,
    
    -- Context
    context_before TEXT, -- Surrounding context
    context_after TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT citations_source_check CHECK (
        (block_id IS NOT NULL) OR (suggestion_id IS NOT NULL)
    )
);
```

### 5. **workflow_transitions** - Audit Trail
```sql
CREATE TABLE workflow_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_id UUID NOT NULL REFERENCES guidance_versions(id),
    
    -- Transition Details  
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    from_stage TEXT NOT NULL,
    to_stage TEXT NOT NULL,
    
    -- Actor & Context
    actor_id UUID NOT NULL,
    actor_role TEXT NOT NULL, -- editor | reviewer | publisher | admin
    
    -- Change Details
    change_summary TEXT NOT NULL,
    rationale TEXT,
    blocks_affected INTEGER DEFAULT 0,
    suggestions_processed INTEGER DEFAULT 0,
    
    -- Metadata
    transition_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);
```

### 6. **knowledge_source_governance** - Extended Source Management
```sql
-- Extend existing knowledge_sources table
ALTER TABLE knowledge_sources 
ADD COLUMN IF NOT EXISTS owner_id UUID,
ADD COLUMN IF NOT EXISTS license_note TEXT,
ADD COLUMN IF NOT EXISTS robots_compliance BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS canonical_url TEXT,
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'url', -- url | file | sharepoint | paste
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'internal', -- public | internal | restricted
ADD COLUMN IF NOT EXISTS governance_notes JSONB DEFAULT '{}';

-- Add deduplication index
CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_sources_canonical 
ON knowledge_sources(canonical_url) WHERE canonical_url IS NOT NULL;
```

## 🔗 Integration Points with Existing System

### **EnhancedUnifiedGuidanceService** Integration:
```typescript
// Current method signature (unchanged)
static async getEnhancedGuidance(
  category: string, 
  selectedFrameworks: Record<string, boolean | string>
): Promise<string>

// New versioned method  
static async getVersionedGuidance(
  categoryId: string,
  version: 'draft' | 'published' | number,
  selectedFrameworks: Record<string, boolean | string>
): Promise<{
  content: string;
  version: number;
  citations: Citation[];
  lastModified: string;
  status: WorkflowStatus;
}>
```

### **ComplianceSimplification** Integration:
- ✅ Existing guidance modal still works
- ✅ Add "Enhanced by AI" badge for AI-improved content
- ✅ Show version info and last updated timestamp  
- ✅ Display citation sources when available

## 📈 Data Flow Architecture

```
1. Current Content → guidance_versions (version 1, status: published)
2. AI Enhancement → ai_suggestions (with citations)  
3. Admin Review → guidance_blocks (approved changes)
4. Publishing → guidance_versions (new version, status: published)
5. User Access → EnhancedUnifiedGuidanceService (latest published version)
```

## 🛡️ Security & Governance

### **RBAC Integration:**
- `Editor`: Create drafts, review suggestions
- `Reviewer`: Approve/reject suggestions, transition to review
- `Publisher`: Publish approved content
- `Admin`: Full access, emergency rollback

### **Audit Compliance:**
- ✅ Immutable versioning
- ✅ Complete change attribution  
- ✅ Citation requirements for all AI content
- ✅ Rollback capability to any previous version

## 🚀 Migration Strategy

### **Phase 1: Foundation** 
1. Create new tables (non-breaking)
2. Migrate existing guidance to `guidance_versions` (version 1, published)
3. Preserve all existing functionality

### **Phase 2: Enhancement**
1. Build AI suggestion pipeline
2. Create admin workflow interface
3. Test with 2-3 categories

### **Phase 3: Full Deployment**
1. Roll out to all 36 categories
2. Enable public-facing enhanced guidance
3. Archive legacy guidance generation

## 📊 Performance Considerations

- **Indexes:** Version lookups, framework filtering, citation retrieval
- **Caching:** Published content cached for 1 hour
- **Archival:** Draft versions older than 90 days auto-archived
- **API Limits:** Rate limiting on AI suggestion generation

---

**Next Steps:** Review this schema design, then proceed to create the migration! 🚀