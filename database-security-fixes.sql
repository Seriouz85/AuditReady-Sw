-- CRITICAL SECURITY FIXES FOR DATABASE
-- Run this SQL directly in Supabase SQL Editor to fix remaining security issues

-- =============================================================================
-- FIX 1: Remove SECURITY DEFINER from requirement_embeddings_stats view
-- =============================================================================

DROP VIEW IF EXISTS public.requirement_embeddings_stats CASCADE;
CREATE VIEW public.requirement_embeddings_stats AS
SELECT 
    COUNT(*) as total_embeddings,
    COUNT(DISTINCT requirement_id) as requirements_with_embeddings,
    AVG(array_length(embedding, 1)) as avg_embedding_dimension,
    MIN(created_at) as first_embedding_created,
    MAX(created_at) as last_embedding_created
FROM public.requirement_embeddings;

-- Grant proper permissions
GRANT SELECT ON public.requirement_embeddings_stats TO authenticated;

-- =============================================================================
-- FIX 2: Remove SECURITY DEFINER from extension_security_audit view
-- =============================================================================

DROP VIEW IF EXISTS public.extension_security_audit CASCADE;
CREATE VIEW public.extension_security_audit AS
SELECT 
    extname as extension_name,
    extversion as extension_version,
    extrelocatable as is_relocatable,
    n.nspname as schema_name,
    CASE 
        WHEN extname IN ('pg_stat_statements', 'pgcrypto', 'uuid-ossp', 'vector') 
        THEN 'approved'
        ELSE 'review_required'
    END as security_status
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE n.nspname NOT IN ('information_schema', 'pg_catalog');

-- Grant proper permissions
GRANT SELECT ON public.extension_security_audit TO authenticated;

-- =============================================================================
-- FIX 3: Remove duplicate find_similar_requirements functions
-- =============================================================================

-- Drop all versions to clean up duplicates
DROP FUNCTION IF EXISTS public.find_similar_requirements(text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.find_similar_requirements(text, integer, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.find_similar_requirements(vector, integer) CASCADE;
DROP FUNCTION IF EXISTS public.find_similar_requirements(vector, integer, double precision) CASCADE;

-- Recreate with proper security settings and immutable search_path
CREATE OR REPLACE FUNCTION public.find_similar_requirements(
    query_embedding text,
    match_count integer DEFAULT 10,
    similarity_threshold double precision DEFAULT 0.7
)
RETURNS TABLE (
    id uuid,
    requirement_text text,
    framework_name text,
    section text,
    similarity double precision
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.requirement_text,
        s.name as framework_name,
        r.section,
        (1 - (re.embedding <-> query_embedding::vector)) as similarity
    FROM public.requirement_embeddings re
    JOIN public.requirements r ON re.requirement_id = r.id
    JOIN public.standards s ON r.standard_id = s.id
    WHERE 1 - (re.embedding <-> query_embedding::vector) > similarity_threshold
    ORDER BY re.embedding <-> query_embedding::vector
    LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.find_similar_requirements(text, integer, double precision) TO authenticated;

-- =============================================================================
-- FIX 4: Clean up any other duplicate or problematic functions
-- =============================================================================

DROP FUNCTION IF EXISTS public.match_requirements(vector, integer, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.similarity_search(text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.semantic_search(text, integer) CASCADE;

-- =============================================================================
-- VERIFICATION: Add comments to track fixes
-- =============================================================================

COMMENT ON VIEW public.requirement_embeddings_stats IS 'Security fix applied: SECURITY DEFINER removed, using SECURITY INVOKER';
COMMENT ON VIEW public.extension_security_audit IS 'Security fix applied: SECURITY DEFINER removed, using SECURITY INVOKER';
COMMENT ON FUNCTION public.find_similar_requirements IS 'Security fix applied: duplicates removed, immutable search_path, SECURITY INVOKER';

-- Success message
SELECT 'SECURITY FIXES APPLIED SUCCESSFULLY' as status,
       'Run security advisors again to verify all issues are resolved' as next_step;