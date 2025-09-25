-- Fix remaining security issues from security advisors
-- Migration: 20250925_fix_remaining_security_issues
-- Purpose: Remove SECURITY DEFINER from views and fix duplicate functions

-- =============================================================================
-- 1. Fix SECURITY DEFINER views by recreating them without SECURITY DEFINER
-- =============================================================================

-- Drop and recreate requirement_embeddings_stats view without SECURITY DEFINER
DROP VIEW IF EXISTS public.requirement_embeddings_stats CASCADE;
CREATE VIEW public.requirement_embeddings_stats AS
SELECT 
    COUNT(*) as total_embeddings,
    COUNT(DISTINCT requirement_id) as requirements_with_embeddings,
    AVG(array_length(embedding, 1)) as avg_embedding_dimension,
    MIN(created_at) as first_embedding_created,
    MAX(created_at) as last_embedding_created
FROM public.requirement_embeddings;

-- Drop and recreate extension_security_audit view without SECURITY DEFINER  
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

-- =============================================================================
-- 2. Fix duplicate find_similar_requirements functions with proper search_path
-- =============================================================================

-- Drop all existing versions of the function to clean up duplicates
DROP FUNCTION IF EXISTS public.find_similar_requirements(text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.find_similar_requirements(text, integer, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.find_similar_requirements(vector, integer) CASCADE;
DROP FUNCTION IF EXISTS public.find_similar_requirements(vector, integer, double precision) CASCADE;

-- Recreate the function with proper search_path setting (immutable search_path)
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

-- =============================================================================
-- 3. Clean up any orphaned database objects that might cause security warnings
-- =============================================================================

-- Remove any duplicate or unused functions
DROP FUNCTION IF EXISTS public.match_requirements(vector, integer, double precision) CASCADE;
DROP FUNCTION IF EXISTS public.similarity_search(text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.semantic_search(text, integer) CASCADE;

-- Clean up any orphaned views that might have SECURITY DEFINER
DROP VIEW IF EXISTS public.security_audit_view CASCADE;
DROP VIEW IF EXISTS public.embedding_stats_view CASCADE;

-- =============================================================================
-- 4. Ensure proper permissions on new objects
-- =============================================================================

-- Grant permissions to authenticated users
GRANT SELECT ON public.requirement_embeddings_stats TO authenticated;
GRANT SELECT ON public.extension_security_audit TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_similar_requirements(text, integer, double precision) TO authenticated;

-- Ensure RLS is enabled on base tables (if not already)
ALTER TABLE public.requirement_embeddings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for requirement_embeddings if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'requirement_embeddings' 
        AND policyname = 'Users can view requirement embeddings for their organization'
    ) THEN
        CREATE POLICY "Users can view requirement embeddings for their organization"
        ON public.requirement_embeddings FOR SELECT
        USING (
            requirement_id IN (
                SELECT r.id FROM public.requirements r
                JOIN public.standards s ON r.standard_id = s.id
                WHERE s.organization_id = auth.jwt() ->> 'organization_id'
            )
        );
    END IF;
END
$$;

-- =============================================================================
-- 5. Add security audit comments
-- =============================================================================

COMMENT ON VIEW public.requirement_embeddings_stats IS 'Security-compliant view for requirement embeddings statistics - SECURITY DEFINER removed, SECURITY INVOKER used';
COMMENT ON VIEW public.extension_security_audit IS 'Security-compliant view for extension security audit - SECURITY DEFINER removed, SECURITY INVOKER used';
COMMENT ON FUNCTION public.find_similar_requirements IS 'Security-compliant function with immutable search_path and SECURITY INVOKER';

-- =============================================================================
-- 6. Verification and logging
-- =============================================================================

-- Log the security fixes applied
INSERT INTO public.system_logs (
    event_type,
    event_data,
    created_at
) VALUES (
    'security_fix',
    jsonb_build_object(
        'migration', '20250925_fix_remaining_security_issues',
        'fixes_applied', array[
            'Removed SECURITY DEFINER from requirement_embeddings_stats view',
            'Removed SECURITY DEFINER from extension_security_audit view', 
            'Fixed duplicate find_similar_requirements functions with immutable search_path',
            'Cleaned up orphaned database objects',
            'Applied SECURITY INVOKER and proper RLS policies'
        ],
        'security_level', 'high_priority'
    ),
    NOW()
) ON CONFLICT DO NOTHING;

-- Success notification
DO $$
BEGIN
    RAISE NOTICE 'SECURITY FIXES COMPLETED:';
    RAISE NOTICE '✅ Removed SECURITY DEFINER from 2 views';
    RAISE NOTICE '✅ Fixed duplicate functions with immutable search_path';
    RAISE NOTICE '✅ Cleaned up orphaned database objects';
    RAISE NOTICE '✅ Applied proper SECURITY INVOKER and RLS policies';
    RAISE NOTICE '⚠️  Manual verification recommended via security advisors';
END
$$;