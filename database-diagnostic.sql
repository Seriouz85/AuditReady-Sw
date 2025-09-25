-- Database Diagnostic Script for ComplianceSimplification Issues
-- Run this in Supabase SQL Editor to check current database state

-- 1. Check if compliance tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename LIKE '%compliance%' 
   OR tablename LIKE '%unified%'
   OR tablename LIKE '%requirements%'
   OR tablename LIKE '%standards%'
ORDER BY tablename;

-- 2. Count rows in each compliance-related table
SELECT 
  'organizations' as table_name, 
  COUNT(*) as row_count 
FROM organizations
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'unified_compliance_categories', COUNT(*) 
FROM unified_compliance_categories
UNION ALL
SELECT 'unified_requirements', COUNT(*) 
FROM unified_requirements
UNION ALL
SELECT 'requirements_library', COUNT(*) 
FROM requirements_library
UNION ALL
SELECT 'standards_library', COUNT(*) 
FROM standards_library
ORDER BY table_name;

-- 3. Check what categories exist (if table exists)
SELECT 
  id,
  name,
  description,
  sort_order,
  is_active
FROM unified_compliance_categories
ORDER BY sort_order
LIMIT 10;

-- 4. Check what standards exist (if table exists)
SELECT 
  id,
  name,
  code,
  description,
  category
FROM standards_library
ORDER BY name
LIMIT 10;

-- 5. Check sample requirements (if table exists)
SELECT 
  r.id,
  r.control_id,
  r.title,
  r.category,
  s.name as standard_name
FROM requirements_library r
LEFT JOIN standards_library s ON r.standard_id = s.id
ORDER BY r.title
LIMIT 10;

-- 6. Check unified requirements structure (if table exists)
SELECT 
  ur.id,
  ur.title,
  ur.category_id,
  uc.name as category_name,
  array_length(ur.sub_requirements, 1) as sub_req_count
FROM unified_requirements ur
LEFT JOIN unified_compliance_categories uc ON ur.category_id = uc.id
ORDER BY uc.sort_order, ur.sort_order
LIMIT 10;

-- 7. Check for any existing compliance mapping data tables
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN (
  'compliance_mapping_data',
  'framework_mappings',
  'compliance_categories',
  'compliance_requirements'
)
ORDER BY table_name, ordinal_position;

-- 8. Test data relationships
SELECT 
  uc.name as category,
  COUNT(ur.id) as unified_requirements_count,
  COUNT(DISTINCT s.name) as frameworks_referenced
FROM unified_compliance_categories uc
LEFT JOIN unified_requirements ur ON uc.id = ur.category_id
LEFT JOIN requirements_library rl ON uc.name ILIKE '%' || rl.category || '%'
LEFT JOIN standards_library s ON rl.standard_id = s.id
GROUP BY uc.id, uc.name, uc.sort_order
ORDER BY uc.sort_order;

-- 9. Check for demo organization and user
SELECT 
  o.name as org_name,
  o.type,
  o.industry,
  u.email,
  u.role,
  u.is_demo
FROM organizations o
LEFT JOIN users u ON o.id = u.organization_id
WHERE o.name LIKE '%Demo%' OR u.is_demo = true;

-- 10. Sample framework requirements by category
SELECT 
  s.name as framework,
  r.category,
  COUNT(*) as requirement_count,
  array_agg(r.control_id ORDER BY r.control_id) as sample_control_ids
FROM requirements_library r
JOIN standards_library s ON r.standard_id = s.id
GROUP BY s.name, r.category
ORDER BY s.name, r.category
LIMIT 20;

-- 11. Check table sizes and estimated completeness
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  most_common_vals
FROM pg_stats 
WHERE tablename IN (
  'unified_compliance_categories',
  'unified_requirements', 
  'requirements_library',
  'standards_library'
)
AND attname IN ('name', 'category', 'title', 'code')
ORDER BY tablename, attname;

-- 12. DIAGNOSTIC SUMMARY
-- Run this to get a quick health check
WITH table_counts AS (
  SELECT 
    'unified_compliance_categories' as table_name,
    (SELECT COUNT(*) FROM unified_compliance_categories) as count,
    CASE WHEN (SELECT COUNT(*) FROM unified_compliance_categories) > 15 THEN 'GOOD' 
         WHEN (SELECT COUNT(*) FROM unified_compliance_categories) > 5 THEN 'MINIMAL'
         ELSE 'EMPTY' END as status
  UNION ALL
  SELECT 
    'unified_requirements',
    (SELECT COUNT(*) FROM unified_requirements),
    CASE WHEN (SELECT COUNT(*) FROM unified_requirements) > 100 THEN 'GOOD'
         WHEN (SELECT COUNT(*) FROM unified_requirements) > 20 THEN 'MINIMAL' 
         ELSE 'EMPTY' END
  UNION ALL
  SELECT 
    'requirements_library',
    (SELECT COUNT(*) FROM requirements_library),
    CASE WHEN (SELECT COUNT(*) FROM requirements_library) > 500 THEN 'GOOD'
         WHEN (SELECT COUNT(*) FROM requirements_library) > 100 THEN 'MINIMAL'
         ELSE 'EMPTY' END
  UNION ALL
  SELECT 
    'standards_library', 
    (SELECT COUNT(*) FROM standards_library),
    CASE WHEN (SELECT COUNT(*) FROM standards_library) > 5 THEN 'GOOD'
         WHEN (SELECT COUNT(*) FROM standards_library) > 2 THEN 'MINIMAL'
         ELSE 'EMPTY' END
)
SELECT 
  table_name,
  count,
  status,
  CASE 
    WHEN status = 'EMPTY' THEN '🔴 CRITICAL - Table empty, will cause content generation failures'
    WHEN status = 'MINIMAL' THEN '🟡 WARNING - Minimal data, may cause limited content'
    WHEN status = 'GOOD' THEN '✅ OK - Sufficient data for content generation'
  END as diagnostic
FROM table_counts
ORDER BY 
  CASE status 
    WHEN 'EMPTY' THEN 1 
    WHEN 'MINIMAL' THEN 2 
    WHEN 'GOOD' THEN 3 
  END;

-- 13. RECOMMENDATIONS BASED ON FINDINGS
-- (This is a comment block - actual recommendations will be based on above results)
/*
LIKELY SCENARIOS AND SOLUTIONS:

Scenario 1: All tables EMPTY
- Cause: Database not properly seeded
- Solution: Run seed migration with compliance data
- Impact: Complete failure of content generation

Scenario 2: Tables exist but MINIMAL data  
- Cause: Partial seeding or test data only
- Solution: Import full compliance framework data
- Impact: Limited categories with basic content

Scenario 3: unified_compliance_categories exists but unified_requirements EMPTY
- Cause: Category structure exists but no actual requirements
- Solution: Populate unified_requirements table with proper content
- Impact: Categories appear but show no implementation details

Scenario 4: requirements_library EMPTY but unified tables have data
- Cause: Using unified system without framework reference data
- Solution: Import actual framework requirements for proper mapping
- Impact: Content appears but no framework references

Scenario 5: All tables GOOD
- Cause: Proper database setup
- Solution: Check template name matching issues in code
- Impact: Should work but may have category name mismatches
*/