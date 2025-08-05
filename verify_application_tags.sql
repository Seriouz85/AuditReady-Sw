-- ============================================================================
-- Verification Script for Application Tags
-- Use this to verify that requirements have been properly tagged
-- ============================================================================

-- Check if the tags column exists
SELECT 
    table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'requirements_library' 
  AND column_name = 'tags';

-- Count total requirements with application tag by standard
SELECT 
    sl.name AS standard_name,
    COUNT(*) AS tagged_requirements
FROM requirements_library rl
JOIN standards_library sl ON rl.standard_id = sl.id
WHERE 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]))
GROUP BY sl.name
ORDER BY sl.name;

-- List all ISO 27002 requirements with application tag
SELECT 
    rl.control_id,
    rl.title,
    rl.tags
FROM requirements_library rl
JOIN standards_library sl ON rl.standard_id = sl.id
WHERE sl.name ILIKE '%ISO%27002%'
  AND 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]))
ORDER BY rl.control_id;

-- List all CIS Controls with application tag
SELECT 
    rl.control_id,
    rl.title,
    rl.tags
FROM requirements_library rl
JOIN standards_library sl ON rl.standard_id = sl.id
WHERE sl.name ILIKE '%CIS%Controls%'
  AND 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]))
ORDER BY rl.control_id;

-- Check specific requirements mentioned in the task
SELECT 
    sl.name AS standard_name,
    rl.control_id,
    rl.title,
    CASE 
        WHEN 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[])) 
        THEN '✅ Tagged' 
        ELSE '❌ Not Tagged' 
    END AS tag_status,
    rl.tags
FROM requirements_library rl
JOIN standards_library sl ON rl.standard_id = sl.id
WHERE (
    (sl.name ILIKE '%ISO%27002%' AND rl.control_id IN ('8.11', '8.12', '8.25', '8.26', '8.27', '8.28'))
    OR 
    (sl.name ILIKE '%CIS%Controls%' AND rl.control_id = '16.1')
)
ORDER BY sl.name, rl.control_id;

-- Summary statistics
SELECT 
    'ISO 27002 Application Requirements' AS category,
    COUNT(*) AS count
FROM requirements_library rl
JOIN standards_library sl ON rl.standard_id = sl.id
WHERE sl.name ILIKE '%ISO%27002%'
  AND 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]))

UNION ALL

SELECT 
    'CIS Controls Application Requirements' AS category,
    COUNT(*) AS count
FROM requirements_library rl
JOIN standards_library sl ON rl.standard_id = sl.id
WHERE sl.name ILIKE '%CIS%Controls%'
  AND 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]))

UNION ALL

SELECT 
    'Total Application Requirements' AS category,
    COUNT(*) AS count
FROM requirements_library rl
WHERE 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]));