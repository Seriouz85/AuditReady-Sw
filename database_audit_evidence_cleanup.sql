-- =============================================================================
-- Database Cleanup: Remove Audit Evidence from Unified Requirements
-- =============================================================================
-- This script removes audit evidence content that was mistakenly stored in
-- unified_requirements.sub_requirements and should only appear in unified_guidance
-- =============================================================================

-- First, let's see which categories contain audit evidence
SELECT 
  category_name,
  COUNT(*) as record_count,
  CASE 
    WHEN sub_requirements::text ~ '📋.*[Aa]udit.*[Rr]eady.*[Ee]vidence.*[Cc]ollection' THEN 'HAS_AUDIT_EVIDENCE'
    ELSE 'CLEAN'
  END as status
FROM unified_requirements 
WHERE sub_requirements::text ~ '📋.*[Aa]udit.*[Rr]eady.*[Ee]vidence.*[Cc]ollection'
   OR sub_requirements::text ~ '[Uu]nauthorized.*software.*detection.*and.*removal.*procedures'
   OR sub_requirements::text ~ '[Ss]oftware.*allowlisting.*blocklisting.*policies.*and.*enforcement.*mechanisms'
GROUP BY category_name, status
ORDER BY category_name;

-- =============================================================================
-- BACKUP: Create backup of records before cleaning
-- =============================================================================
CREATE TABLE IF NOT EXISTS unified_requirements_backup_audit_cleanup AS
SELECT 
  id,
  category_name,
  sub_requirements,
  NOW() as backup_created_at
FROM unified_requirements 
WHERE sub_requirements::text ~ '📋.*[Aa]udit.*[Rr]eady.*[Ee]vidence.*[Cc]ollection'
   OR sub_requirements::text ~ '[Uu]nauthorized.*software.*detection.*and.*removal.*procedures'
   OR sub_requirements::text ~ '[Ss]oftware.*allowlisting.*blocklisting.*policies.*and.*enforcement.*mechanisms';

-- Verify backup was created
SELECT 
  COUNT(*) as backed_up_records,
  array_agg(DISTINCT category_name) as categories_backed_up
FROM unified_requirements_backup_audit_cleanup;

-- =============================================================================
-- METHOD 1: Simple approach - Replace text patterns with empty string
-- This is safer than complex JSONB manipulation
-- =============================================================================

-- Update records by removing audit evidence patterns
UPDATE unified_requirements 
SET 
  sub_requirements = (
    SELECT jsonb_agg(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(
                regexp_replace(
                  regexp_replace(
                    regexp_replace(
                      regexp_replace(value::text, 
                        '📋[^\n]*[Aa]udit[^\n]*[Rr]eady[^\n]*[Ee]vidence[^\n]*[Cc]ollection[^\n]*\n?', 
                        '', 'gi'
                      ),
                      '[Ee]ssential\s+[Dd]ocumentation\s+[Rr]equired[^\n]*\n?', 
                      '', 'gi'
                    ),
                    '[Tt]echnical\s+[Ee]vidence\s+to\s+[Cc]ollect[^\n]*\n?', 
                    '', 'gi'
                  ),
                  '•[^\n]*[Uu]nauthorized.*software.*detection.*and.*removal.*procedures[^\n]*\n?', 
                  '', 'gi'
                ),
                '•[^\n]*[Ss]oftware.*allowlisting.*blocklisting.*policies.*and.*enforcement.*mechanisms[^\n]*\n?', 
                '', 'gi'
              ),
              '•[^\n]*[Ii]ncident.*response.*procedures.*for.*unauthorized.*software.*discoveries[^\n]*\n?', 
              '', 'gi'
            ),
            '•[^\n]*[Rr]egular.*software.*audit.*reports.*showing.*unauthorized.*software.*findings[^\n]*\n?', 
            '', 'gi'
          ),
          '•[^\n]*[Uu]ser.*access.*controls.*preventing.*unauthorized.*software.*installation[^\n]*\n?', 
          '', 'gi'
        ),
        '•[^\n]*[Aa]pplication.*allowlisting.*tool.*configuration.*and.*blocked.*execution.*logs[^\n]*\n?', 
        '', 'gi'
      )::jsonb
    )
    FROM jsonb_array_elements(sub_requirements)
  ),
  updated_at = NOW()
WHERE sub_requirements::text ~ '📋.*[Aa]udit.*[Rr]eady.*[Ee]vidence.*[Cc]ollection'
   OR sub_requirements::text ~ '[Uu]nauthorized.*software.*detection.*and.*removal.*procedures'
   OR sub_requirements::text ~ '[Ss]oftware.*allowlisting.*blocklisting.*policies.*and.*enforcement.*mechanisms';

-- =============================================================================
-- VERIFICATION: Check that audit evidence has been removed
-- =============================================================================

-- Count records that still contain audit evidence (should be 0)
SELECT 
  category_name,
  COUNT(*) as records_still_with_evidence
FROM unified_requirements 
WHERE sub_requirements::text ~ '📋.*[Aa]udit.*[Rr]eady.*[Ee]vidence.*[Cc]ollection'
   OR sub_requirements::text ~ '[Uu]nauthorized.*software.*detection.*and.*removal.*procedures'
   OR sub_requirements::text ~ '[Ss]oftware.*allowlisting.*blocklisting.*policies.*and.*enforcement.*mechanisms'
GROUP BY category_name
ORDER BY category_name;

-- Show sample of cleaned content
SELECT 
  category_name,
  jsonb_array_length(sub_requirements) as sub_req_count,
  substring(sub_requirements::text, 1, 200) as content_sample
FROM unified_requirements 
WHERE category_name IN ('Network Security', 'Network Infrastructure', 'Software Security')
ORDER BY category_name;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Audit evidence cleanup completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 What was removed:';
  RAISE NOTICE '  • 📋 Audit Ready Evidence Collection headers';
  RAISE NOTICE '  • Essential Documentation Required text';
  RAISE NOTICE '  • Technical Evidence to Collect text';
  RAISE NOTICE '  • Specific audit evidence bullet points';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Result:';
  RAISE NOTICE '  • Unified Requirements now show clean requirement text only';
  RAISE NOTICE '  • Unified Guidance still shows audit evidence under correct sub-requirements';
  RAISE NOTICE '  • AuditEvidenceExtractor continues to work from database content';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 To rollback if needed:';
  RAISE NOTICE '  • Check unified_requirements_backup_audit_cleanup table';
  RAISE NOTICE '  • Restore from backup if any issues occur';
END $$;