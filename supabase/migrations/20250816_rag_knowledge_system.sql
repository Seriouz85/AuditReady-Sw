-- RAG Knowledge Enhancement System Database Schema
-- This migration creates the foundation for AI-powered knowledge management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ================================
-- KNOWLEDGE SOURCES MANAGEMENT
-- ================================

-- Knowledge sources table for managing expert content URLs
CREATE TABLE knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  title TEXT,
  description TEXT,
  
  -- Authority and trust scoring
  authority_score INTEGER DEFAULT 5 CHECK (authority_score >= 1 AND authority_score <= 10),
  credibility_rating TEXT DEFAULT 'verified' CHECK (credibility_rating IN ('expert', 'verified', 'community', 'pending')),
  
  -- Content categorization
  content_type TEXT NOT NULL DEFAULT 'guidance' CHECK (content_type IN ('guidance', 'standards', 'bestpractice', 'implementation', 'regulatory')),
  compliance_frameworks TEXT[] DEFAULT '{}', -- iso27001, nist, cis, etc.
  focus_areas TEXT[] DEFAULT '{}', -- governance, risk, access, etc.
  
  -- Update and maintenance
  update_frequency INTERVAL DEFAULT '1 week',
  last_scraped TIMESTAMPTZ,
  last_updated TIMESTAMPTZ,
  last_modified_check TIMESTAMPTZ,
  content_hash TEXT, -- For change detection
  
  -- Status and monitoring
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'pending', 'archived')),
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  success_rate FLOAT DEFAULT 1.0,
  
  -- Configuration
  scraping_config JSONB DEFAULT '{}', -- selectors, rate limits, etc.
  processing_rules JSONB DEFAULT '{}', -- content extraction rules
  
  -- Metadata and tracking
  metadata JSONB DEFAULT '{}',
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_knowledge_sources_domain ON knowledge_sources(domain);
CREATE INDEX idx_knowledge_sources_status ON knowledge_sources(status);
CREATE INDEX idx_knowledge_sources_content_type ON knowledge_sources(content_type);
CREATE INDEX idx_knowledge_sources_frameworks ON knowledge_sources USING GIN(compliance_frameworks);
CREATE INDEX idx_knowledge_sources_last_scraped ON knowledge_sources(last_scraped);

-- ================================
-- KNOWLEDGE CONTENT STORAGE
-- ================================

-- Extracted and processed content chunks
CREATE TABLE knowledge_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  
  -- Content identification
  title TEXT,
  content_chunk TEXT NOT NULL,
  content_hash TEXT UNIQUE NOT NULL, -- Prevents duplicates
  original_url TEXT,
  section_path TEXT, -- breadcrumb/xpath to original location
  
  -- Content analysis and scoring
  compliance_categories TEXT[] DEFAULT '{}', -- which categories this applies to
  frameworks TEXT[] DEFAULT '{}', -- which frameworks mentioned
  requirement_keywords TEXT[] DEFAULT '{}', -- extracted keywords
  
  -- Quality and relevance scoring
  authority_score INTEGER, -- inherited from source
  relevance_score FLOAT DEFAULT 0.0, -- 0-1 based on content analysis
  freshness_score FLOAT DEFAULT 1.0, -- 0-1 based on age and updates
  quality_score FLOAT DEFAULT 0.0, -- 0-1 overall quality assessment
  confidence_score FLOAT DEFAULT 0.0, -- AI confidence in content accuracy
  
  -- Content metrics
  word_count INTEGER,
  readability_score FLOAT, -- Flesch reading ease or similar
  technical_depth TEXT CHECK (technical_depth IN ('basic', 'intermediate', 'advanced', 'expert')),
  
  -- Processing metadata
  extraction_method TEXT DEFAULT 'web_scraping',
  processing_version TEXT DEFAULT '1.0',
  language_detected TEXT DEFAULT 'en',
  content_structure JSONB DEFAULT '{}', -- headings, lists, etc.
  
  -- References and citations
  external_references TEXT[], -- links to other sources
  citation_count INTEGER DEFAULT 0,
  source_authority JSONB DEFAULT '{}', -- author info, publication details
  
  -- Temporal tracking
  extracted_at TIMESTAMPTZ DEFAULT NOW(),
  indexed_at TIMESTAMPTZ,
  last_validated TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- when content should be refreshed
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for efficient content retrieval
CREATE INDEX idx_knowledge_content_source ON knowledge_content(source_id);
CREATE INDEX idx_knowledge_content_hash ON knowledge_content(content_hash);
CREATE INDEX idx_knowledge_content_categories ON knowledge_content USING GIN(compliance_categories);
CREATE INDEX idx_knowledge_content_frameworks ON knowledge_content USING GIN(frameworks);
CREATE INDEX idx_knowledge_content_quality ON knowledge_content(quality_score DESC);
CREATE INDEX idx_knowledge_content_relevance ON knowledge_content(relevance_score DESC);
CREATE INDEX idx_knowledge_content_extracted ON knowledge_content(extracted_at DESC);

-- ================================
-- VECTOR EMBEDDINGS FOR SEMANTIC SEARCH
-- ================================

-- Vector embeddings for semantic similarity search
CREATE TABLE vector_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES knowledge_content(id) ON DELETE CASCADE,
  
  -- Vector data
  embedding vector(1536), -- OpenAI/Gemini embedding dimension
  embedding_model TEXT DEFAULT 'gemini-embedding-001',
  model_version TEXT DEFAULT '1.0',
  
  -- Embedding metadata
  chunk_index INTEGER DEFAULT 0, -- for content split across multiple embeddings
  total_chunks INTEGER DEFAULT 1,
  embedding_method TEXT DEFAULT 'sentence_transformers',
  
  -- Quality and validation
  embedding_quality FLOAT DEFAULT 1.0,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'failed', 'outdated')),
  
  -- Performance tracking
  similarity_threshold FLOAT DEFAULT 0.7,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index (using ivfflat for performance)
CREATE INDEX idx_vector_embeddings_similarity ON vector_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_vector_embeddings_content ON vector_embeddings(content_id);
CREATE INDEX idx_vector_embeddings_model ON vector_embeddings(embedding_model);
CREATE INDEX idx_vector_embeddings_quality ON vector_embeddings(embedding_quality DESC);

-- ================================
-- RAG GENERATION HISTORY & ANALYTICS
-- ================================

-- Track RAG generation attempts and results
CREATE TABLE rag_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Request context
  requirement_category TEXT NOT NULL,
  requirement_title TEXT NOT NULL,
  user_frameworks JSONB DEFAULT '{}', -- selected frameworks
  user_context JSONB DEFAULT '{}', -- industry, role, etc.
  
  -- Generated content
  generated_content TEXT NOT NULL,
  content_length INTEGER,
  content_quality_score FLOAT,
  
  -- Knowledge sources used
  source_ids UUID[] DEFAULT '{}',
  knowledge_content_ids UUID[] DEFAULT '{}',
  embedding_similarities FLOAT[] DEFAULT '{}',
  
  -- Generation metadata
  generation_method TEXT NOT NULL CHECK (generation_method IN ('rag', 'hybrid', 'fallback', 'cache')),
  ai_model_used TEXT DEFAULT 'gemini-pro',
  prompt_version TEXT DEFAULT '1.0',
  context_window_size INTEGER,
  
  -- Performance metrics
  generation_time_ms INTEGER,
  token_usage JSONB DEFAULT '{}',
  api_cost_estimate DECIMAL(10,6),
  
  -- Quality and validation
  quality_score FLOAT,
  validation_passed BOOLEAN DEFAULT FALSE,
  user_feedback INTEGER CHECK (user_feedback >= 1 AND user_feedback <= 5),
  admin_approval TEXT CHECK (admin_approval IN ('pending', 'approved', 'rejected', 'needs_review')),
  
  -- Fallback information
  fallback_reason TEXT,
  fallback_to_rules BOOLEAN DEFAULT FALSE,
  
  -- Comparison with previous versions
  improvement_score FLOAT, -- compared to previous generation
  similarity_to_previous FLOAT,
  
  -- Metadata and tracking
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics and performance
CREATE INDEX idx_rag_history_category ON rag_generation_history(requirement_category);
CREATE INDEX idx_rag_history_method ON rag_generation_history(generation_method);
CREATE INDEX idx_rag_history_quality ON rag_generation_history(quality_score DESC);
CREATE INDEX idx_rag_history_created ON rag_generation_history(created_at DESC);
CREATE INDEX idx_rag_history_user ON rag_generation_history(user_id);
CREATE INDEX idx_rag_history_performance ON rag_generation_history(generation_time_ms);

-- ================================
-- CONTENT VALIDATION & QUALITY CONTROL
-- ================================

-- Track content validation and quality control
CREATE TABLE content_validation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was validated
  validation_type TEXT NOT NULL CHECK (validation_type IN ('source', 'content', 'generation', 'embedding')),
  target_id UUID NOT NULL, -- references any of the above tables
  target_type TEXT NOT NULL CHECK (target_type IN ('knowledge_source', 'knowledge_content', 'generation', 'embedding')),
  
  -- Validation results
  validation_status TEXT NOT NULL CHECK (validation_status IN ('passed', 'failed', 'warning', 'needs_review')),
  quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
  
  -- Specific validation checks
  checks_performed JSONB DEFAULT '{}', -- which validation rules were applied
  check_results JSONB DEFAULT '{}', -- detailed results for each check
  issues_found TEXT[],
  recommendations TEXT[],
  
  -- Validation context
  validation_rules_version TEXT DEFAULT '1.0',
  automated_validation BOOLEAN DEFAULT TRUE,
  human_reviewer UUID REFERENCES auth.users(id),
  review_notes TEXT,
  
  -- Performance and metrics
  validation_time_ms INTEGER,
  confidence_level FLOAT,
  false_positive_risk FLOAT,
  
  -- Actions taken
  corrective_actions TEXT[],
  content_updated BOOLEAN DEFAULT FALSE,
  source_flagged BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for validation tracking
CREATE INDEX idx_validation_logs_type ON content_validation_logs(validation_type);
CREATE INDEX idx_validation_logs_target ON content_validation_logs(target_id, target_type);
CREATE INDEX idx_validation_logs_status ON content_validation_logs(validation_status);
CREATE INDEX idx_validation_logs_created ON content_validation_logs(created_at DESC);
CREATE INDEX idx_validation_logs_quality ON content_validation_logs(quality_score DESC);

-- ================================
-- KNOWLEDGE ANALYTICS & METRICS
-- ================================

-- Daily aggregated metrics for monitoring and analytics
CREATE TABLE knowledge_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_recorded DATE NOT NULL,
  
  -- Source metrics
  total_sources INTEGER DEFAULT 0,
  active_sources INTEGER DEFAULT 0,
  failed_sources INTEGER DEFAULT 0,
  new_sources_added INTEGER DEFAULT 0,
  
  -- Content metrics
  total_content_chunks INTEGER DEFAULT 0,
  new_content_added INTEGER DEFAULT 0,
  content_updated INTEGER DEFAULT 0,
  content_quality_avg FLOAT DEFAULT 0,
  
  -- Generation metrics
  total_generations INTEGER DEFAULT 0,
  rag_generations INTEGER DEFAULT 0,
  fallback_generations INTEGER DEFAULT 0,
  avg_generation_time_ms INTEGER DEFAULT 0,
  avg_quality_score FLOAT DEFAULT 0,
  
  -- User engagement metrics
  unique_users INTEGER DEFAULT 0,
  user_satisfaction_avg FLOAT DEFAULT 0,
  feedback_responses INTEGER DEFAULT 0,
  
  -- Performance metrics
  avg_response_time_ms INTEGER DEFAULT 0,
  cache_hit_rate FLOAT DEFAULT 0,
  api_cost_total DECIMAL(10,2) DEFAULT 0,
  error_rate FLOAT DEFAULT 0,
  
  -- Quality metrics
  validation_pass_rate FLOAT DEFAULT 0,
  content_freshness_avg FLOAT DEFAULT 0,
  source_reliability_avg FLOAT DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint and indexes for analytics
CREATE UNIQUE INDEX idx_knowledge_analytics_date ON knowledge_analytics(date_recorded);
CREATE INDEX idx_knowledge_analytics_created ON knowledge_analytics(created_at DESC);

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

-- Enable RLS on all tables
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_validation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_analytics ENABLE ROW LEVEL SECURITY;

-- Knowledge sources policies
CREATE POLICY "knowledge_sources_select" ON knowledge_sources FOR SELECT USING (true); -- Public read for content generation
CREATE POLICY "knowledge_sources_insert" ON knowledge_sources FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);
CREATE POLICY "knowledge_sources_update" ON knowledge_sources FOR UPDATE USING (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);
CREATE POLICY "knowledge_sources_delete" ON knowledge_sources FOR DELETE USING (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name = 'super_admin')
);

-- Knowledge content policies (similar pattern)
CREATE POLICY "knowledge_content_select" ON knowledge_content FOR SELECT USING (true);
CREATE POLICY "knowledge_content_manage" ON knowledge_content FOR ALL USING (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);

-- Vector embeddings policies
CREATE POLICY "vector_embeddings_select" ON vector_embeddings FOR SELECT USING (true);
CREATE POLICY "vector_embeddings_manage" ON vector_embeddings FOR ALL USING (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);

-- RAG generation history policies (users can see their own, admins see all)
CREATE POLICY "rag_history_user_own" ON rag_generation_history FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);
CREATE POLICY "rag_history_insert" ON rag_generation_history FOR INSERT WITH CHECK (true);

-- Content validation logs (admin only)
CREATE POLICY "validation_logs_admin_only" ON content_validation_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);

-- Knowledge analytics (admin only)
CREATE POLICY "knowledge_analytics_admin_only" ON knowledge_analytics FOR ALL USING (
  EXISTS (SELECT 1 FROM organization_users ou JOIN user_roles ur ON ou.role_id = ur.id WHERE ou.user_id = auth.uid() AND ur.name IN ('admin', 'super_admin'))
);

-- ================================
-- TRIGGERS AND FUNCTIONS
-- ================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_knowledge_sources_updated_at BEFORE UPDATE ON knowledge_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vector_embeddings_updated_at BEFORE UPDATE ON vector_embeddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_validation_logs_updated_at BEFORE UPDATE ON content_validation_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate content quality score
CREATE OR REPLACE FUNCTION calculate_content_quality_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple quality scoring based on multiple factors
  NEW.quality_score := (
    (NEW.relevance_score * 0.3) +
    (NEW.freshness_score * 0.2) +
    (LEAST(NEW.word_count / 500.0, 1.0) * 0.2) + -- optimal length around 500 words
    (NEW.authority_score / 10.0 * 0.3) -- authority contributes 30%
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_knowledge_content_quality BEFORE INSERT OR UPDATE ON knowledge_content FOR EACH ROW EXECUTE FUNCTION calculate_content_quality_score();

-- Function to update analytics daily
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS void AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  INSERT INTO knowledge_analytics (
    date_recorded,
    total_sources,
    active_sources,
    failed_sources,
    total_content_chunks,
    content_quality_avg,
    total_generations,
    rag_generations,
    fallback_generations,
    avg_generation_time_ms,
    avg_quality_score
  )
  SELECT 
    today_date,
    (SELECT COUNT(*) FROM knowledge_sources),
    (SELECT COUNT(*) FROM knowledge_sources WHERE status = 'active'),
    (SELECT COUNT(*) FROM knowledge_sources WHERE status = 'error'),
    (SELECT COUNT(*) FROM knowledge_content),
    (SELECT AVG(quality_score) FROM knowledge_content),
    (SELECT COUNT(*) FROM rag_generation_history WHERE created_at >= today_date),
    (SELECT COUNT(*) FROM rag_generation_history WHERE created_at >= today_date AND generation_method = 'rag'),
    (SELECT COUNT(*) FROM rag_generation_history WHERE created_at >= today_date AND generation_method = 'fallback'),
    (SELECT AVG(generation_time_ms) FROM rag_generation_history WHERE created_at >= today_date),
    (SELECT AVG(quality_score) FROM rag_generation_history WHERE created_at >= today_date AND quality_score IS NOT NULL)
  ON CONFLICT (date_recorded) DO UPDATE SET
    total_sources = EXCLUDED.total_sources,
    active_sources = EXCLUDED.active_sources,
    failed_sources = EXCLUDED.failed_sources,
    total_content_chunks = EXCLUDED.total_content_chunks,
    content_quality_avg = EXCLUDED.content_quality_avg,
    total_generations = EXCLUDED.total_generations,
    rag_generations = EXCLUDED.rag_generations,
    fallback_generations = EXCLUDED.fallback_generations,
    avg_generation_time_ms = EXCLUDED.avg_generation_time_ms,
    avg_quality_score = EXCLUDED.avg_quality_score;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- INITIAL DATA SEEDING
-- ================================

-- Insert initial expert knowledge sources
INSERT INTO knowledge_sources (url, domain, title, description, content_type, compliance_frameworks, focus_areas, authority_score, credibility_rating) VALUES
('https://www.iso27001security.com/html/27001.html', 'iso27001security.com', 'ISO 27001 Security Guide', 'Comprehensive ISO 27001 implementation guidance', 'guidance', ARRAY['iso27001'], ARRAY['governance', 'risk', 'access'], 9, 'expert'),
('https://advisera.com/27001academy/knowledgebase/', 'advisera.com', 'ISO 27001 Academy Knowledge Base', 'Professional ISO 27001 implementation resources', 'guidance', ARRAY['iso27001'], ARRAY['governance', 'risk', 'incident'], 8, 'expert'),
('https://www.itgovernance.co.uk/iso27001', 'itgovernance.co.uk', 'IT Governance ISO 27001 Resources', 'Enterprise-grade ISO 27001 guidance and tools', 'implementation', ARRAY['iso27001'], ARRAY['governance', 'audit'], 8, 'verified'),
('https://blog.isms.online/', 'isms.online', 'ISMS Online Blog', 'Information Security Management System insights', 'bestpractice', ARRAY['iso27001', 'iso27002'], ARRAY['governance', 'risk', 'training'], 7, 'verified'),
('https://www.nist.gov/cyberframework/', 'nist.gov', 'NIST Cybersecurity Framework', 'Official NIST cybersecurity framework documentation', 'standards', ARRAY['nist'], ARRAY['governance', 'risk', 'response'], 10, 'expert');

-- Create initial analytics record
INSERT INTO knowledge_analytics (date_recorded) VALUES (CURRENT_DATE);

-- ================================
-- COMMENTS AND DOCUMENTATION
-- ================================

COMMENT ON TABLE knowledge_sources IS 'Expert knowledge sources for RAG system - manages credible compliance and security guidance websites';
COMMENT ON TABLE knowledge_content IS 'Extracted and processed content chunks from knowledge sources with quality scoring';
COMMENT ON TABLE vector_embeddings IS 'Vector embeddings for semantic similarity search across knowledge content';
COMMENT ON TABLE rag_generation_history IS 'Complete history of RAG generation attempts with performance metrics';
COMMENT ON TABLE content_validation_logs IS 'Quality control and validation tracking for all content types';
COMMENT ON TABLE knowledge_analytics IS 'Daily aggregated metrics for monitoring RAG system performance and quality';

COMMENT ON COLUMN knowledge_sources.authority_score IS 'Trust score 1-10 based on source credibility and expert validation';
COMMENT ON COLUMN knowledge_content.quality_score IS 'Automatically calculated quality score based on relevance, freshness, and authority';
COMMENT ON COLUMN vector_embeddings.embedding IS '1536-dimension vector for semantic similarity search using cosine distance';
COMMENT ON COLUMN rag_generation_history.generation_method IS 'Method used: rag (AI+knowledge), hybrid (AI+rules), fallback (rules only), cache (pre-generated)';

-- Migration completion
SELECT 'RAG Knowledge Enhancement System database schema created successfully' AS status;