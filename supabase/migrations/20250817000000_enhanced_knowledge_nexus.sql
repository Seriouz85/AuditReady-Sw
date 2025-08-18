-- Enhanced AI Knowledge Nexus Database Schema
-- Comprehensive tables for managing AI-powered knowledge content

-- Knowledge Entries Table
CREATE TABLE IF NOT EXISTS knowledge_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    frameworks TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
    content_preview TEXT,
    full_content JSONB,
    quality_score DECIMAL(3,2) DEFAULT 0.0 CHECK (quality_score >= 0 AND quality_score <= 1),
    relevance_score DECIMAL(3,2) DEFAULT 0.0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    processing_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_by TEXT,
    approval_notes TEXT,
    source_domain TEXT,
    
    -- Indexes for performance
    CONSTRAINT unique_url_category UNIQUE (url, category)
);

-- Knowledge Processing Log Table
CREATE TABLE IF NOT EXISTS knowledge_processing_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    processing_time_ms INTEGER,
    categories_identified TEXT[] DEFAULT '{}',
    frameworks_identified TEXT[] DEFAULT '{}',
    content_quality_score DECIMAL(3,2),
    error_message TEXT,
    processing_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for querying recent activity
    INDEX idx_processing_log_created_at ON knowledge_processing_log(created_at DESC)
);

-- Category Statistics View
CREATE OR REPLACE VIEW category_statistics AS
SELECT 
    c.category_name,
    c.category_id,
    COUNT(ke.id) as total_entries,
    COUNT(CASE WHEN ke.status = 'approved' THEN 1 END) as approved_entries,
    COUNT(CASE WHEN ke.status = 'pending' THEN 1 END) as pending_entries,
    COUNT(CASE WHEN ke.status = 'rejected' THEN 1 END) as rejected_entries,
    AVG(ke.quality_score) as avg_quality_score,
    AVG(ke.relevance_score) as avg_relevance_score,
    MAX(ke.updated_at) as last_updated
FROM (
    VALUES 
        ('governance', 'Information Security Governance'),
        ('access_control', 'Access Control'),
        ('asset_management', 'Asset Management'),
        ('cryptography', 'Cryptography'),
        ('physical_security', 'Physical Security'),
        ('operations_security', 'Operations Security'),
        ('communications_security', 'Communications Security'),
        ('system_development', 'System Development'),
        ('supplier_relationships', 'Supplier Relationships'),
        ('incident_management', 'Incident Management'),
        ('business_continuity', 'Business Continuity'),
        ('compliance', 'Compliance'),
        ('risk_management', 'Risk Management'),
        ('training', 'Training & Awareness'),
        ('monitoring', 'Monitoring & Detection'),
        ('vulnerability_management', 'Vulnerability Management'),
        ('data_protection', 'Data Protection'),
        ('identity_management', 'Identity Management'),
        ('security_architecture', 'Security Architecture'),
        ('threat_intelligence', 'Threat Intelligence'),
        ('security_testing', 'Security Testing')
) AS c(category_id, category_name)
LEFT JOIN knowledge_entries ke ON ke.category = c.category_id
GROUP BY c.category_id, c.category_name;

-- Framework Coverage View
CREATE OR REPLACE VIEW framework_coverage AS
SELECT 
    framework,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_entries,
    AVG(quality_score) as avg_quality_score,
    COUNT(DISTINCT category) as categories_covered
FROM knowledge_entries
CROSS JOIN UNNEST(frameworks) AS framework
GROUP BY framework;

-- Quality Metrics View
CREATE OR REPLACE VIEW quality_metrics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as entries_processed,
    AVG(quality_score) as avg_quality_score,
    AVG(relevance_score) as avg_relevance_score,
    COUNT(CASE WHEN status = 'approved' THEN 1 END)::FLOAT / COUNT(*) as approval_rate
FROM knowledge_entries
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Performance Metrics View
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    COUNT(*) as processing_attempts,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_processing,
    AVG(processing_time_ms) as avg_processing_time_ms,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::FLOAT / COUNT(*) as success_rate
FROM knowledge_processing_log
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;

-- Knowledge Content Enrichment Table
CREATE TABLE IF NOT EXISTS knowledge_content_enrichment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES knowledge_entries(id) ON DELETE CASCADE,
    enrichment_type TEXT NOT NULL CHECK (enrichment_type IN ('ai_analysis', 'framework_mapping', 'cross_reference', 'quality_enhancement')),
    enrichment_data JSONB NOT NULL DEFAULT '{}',
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for efficient querying
    INDEX idx_enrichment_entry_id ON knowledge_content_enrichment(entry_id),
    INDEX idx_enrichment_type ON knowledge_content_enrichment(enrichment_type)
);

-- Admin Activity Log
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('approve', 'reject', 'process_url', 'update_settings', 'view_analytics')),
    target_id UUID, -- Can reference knowledge_entries or other entities
    action_details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index for audit trail queries
    INDEX idx_admin_activity_user_id ON admin_activity_log(admin_user_id),
    INDEX idx_admin_activity_created_at ON admin_activity_log(created_at DESC)
);

-- Real-time Sync Status Table
CREATE TABLE IF NOT EXISTS sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES knowledge_entries(id) ON DELETE CASCADE,
    sync_target TEXT NOT NULL CHECK (sync_target IN ('unified_guidance', 'rag_system', 'category_processor')),
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
    sync_details JSONB DEFAULT '{}',
    last_sync_attempt TIMESTAMPTZ DEFAULT NOW(),
    next_sync_scheduled TIMESTAMPTZ,
    error_count INTEGER DEFAULT 0,
    
    -- Ensure one sync record per entry-target combination
    UNIQUE(entry_id, sync_target),
    
    -- Index for sync monitoring
    INDEX idx_sync_status_target ON sync_status(sync_target, sync_status),
    INDEX idx_sync_next_scheduled ON sync_status(next_sync_scheduled) WHERE next_sync_scheduled IS NOT NULL
);

-- Update triggers for automatic timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS update_knowledge_entries_updated_at ON knowledge_entries;
CREATE TRIGGER update_knowledge_entries_updated_at 
    BEFORE UPDATE ON knowledge_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_content_enrichment ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

-- Admin access policies (adjust based on your auth system)
CREATE POLICY "Admin full access" ON knowledge_entries FOR ALL USING (true);
CREATE POLICY "Admin full access" ON knowledge_processing_log FOR ALL USING (true);
CREATE POLICY "Admin full access" ON knowledge_content_enrichment FOR ALL USING (true);
CREATE POLICY "Admin full access" ON admin_activity_log FOR ALL USING (true);
CREATE POLICY "Admin full access" ON sync_status FOR ALL USING (true);

-- Sample data insertion for testing
INSERT INTO knowledge_entries (
    url, 
    title, 
    description, 
    category, 
    frameworks, 
    status, 
    content_preview,
    quality_score,
    relevance_score,
    source_domain
) VALUES 
(
    'https://example.com/iso27001-guide',
    'ISO 27001 Implementation Guide',
    'Comprehensive guide for implementing ISO 27001 information security management system',
    'governance',
    ARRAY['iso27001', 'nist'],
    'approved',
    'This guide provides step-by-step instructions for implementing an ISO 27001 compliant information security management system...',
    0.92,
    0.89,
    'example.com'
),
(
    'https://nist.gov/cybersecurity-framework',
    'NIST Cybersecurity Framework Overview',
    'Official NIST documentation on the cybersecurity framework',
    'risk_management',
    ARRAY['nist'],
    'approved',
    'The NIST Cybersecurity Framework provides a policy framework of computer security guidance...',
    0.95,
    0.93,
    'nist.gov'
),
(
    'https://example.org/access-control-best-practices',
    'Access Control Best Practices',
    'Industry best practices for implementing access control systems',
    'access_control',
    ARRAY['iso27001', 'cisControls'],
    'pending',
    'Access control is fundamental to information security. This document outlines best practices...',
    0.78,
    0.85,
    'example.org'
);

-- Insert corresponding processing log entries
INSERT INTO knowledge_processing_log (
    url,
    status,
    processing_time_ms,
    categories_identified,
    frameworks_identified,
    content_quality_score
) VALUES 
(
    'https://example.com/iso27001-guide',
    'completed',
    3200,
    ARRAY['governance', 'compliance'],
    ARRAY['iso27001', 'nist'],
    0.92
),
(
    'https://nist.gov/cybersecurity-framework',
    'completed',
    2800,
    ARRAY['risk_management', 'governance'],
    ARRAY['nist'],
    0.95
),
(
    'https://example.org/access-control-best-practices',
    'completed',
    4100,
    ARRAY['access_control', 'identity_management'],
    ARRAY['iso27001', 'cisControls'],
    0.78
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_category ON knowledge_entries(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_status ON knowledge_entries(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_frameworks ON knowledge_entries USING GIN(frameworks);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_created_at ON knowledge_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_entries_quality_score ON knowledge_entries(quality_score DESC);

-- Comments for documentation
COMMENT ON TABLE knowledge_entries IS 'Primary table for storing AI-processed knowledge content from web sources';
COMMENT ON TABLE knowledge_processing_log IS 'Audit log of all URL processing activities with performance metrics';
COMMENT ON TABLE knowledge_content_enrichment IS 'Additional AI-generated enrichments and analysis for knowledge entries';
COMMENT ON TABLE admin_activity_log IS 'Comprehensive audit trail of all admin actions in the knowledge nexus';
COMMENT ON TABLE sync_status IS 'Real-time synchronization status with external systems';

COMMENT ON VIEW category_statistics IS 'Aggregated statistics for all compliance categories';
COMMENT ON VIEW framework_coverage IS 'Framework coverage metrics across all knowledge entries';
COMMENT ON VIEW quality_metrics IS 'Quality trends over time for knowledge processing';
COMMENT ON VIEW performance_metrics IS 'System performance metrics for monitoring and optimization';