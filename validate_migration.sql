-- Quick validation script for AI Unified Guidance Migration
-- This tests the migration syntax without applying it

-- Check if required extensions exist
SELECT 
  name, 
  installed_version IS NOT NULL AS is_installed 
FROM pg_available_extensions 
WHERE name IN ('uuid-ossp', 'pgcrypto', 'vector')
ORDER BY name;

-- Validate that tables don't already exist
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE tablename IN (
  'unified_guidance_templates',
  'framework_requirement_mappings', 
  'guidance_content_cache',
  'content_quality_metrics',
  'ai_generation_logs',
  'admin_content_edits'
);

-- Check if referenced tables exist
SELECT 
  schemaname, 
  tablename 
FROM pg_tables 
WHERE tablename IN ('organizations', 'users')
ORDER BY tablename;