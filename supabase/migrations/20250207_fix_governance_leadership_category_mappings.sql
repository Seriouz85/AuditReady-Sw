-- Fix category_id mappings for ISO requirements to "Governance & Leadership"
-- 
-- CRITICAL FIX: Update the category_id field for requirements that should be in 
-- "Governance & Leadership" category but currently have null category_id values.
-- 
-- These requirements were showing correct category text but not properly linked 
-- to the unified category system used by the framework mapping tab.

-- Update specific requirements to have proper category_id for "Governance & Leadership"
UPDATE requirements_library 
SET category_id = 'a595ff1d-161c-4af6-8d7e-f9d47feeb525'::uuid,
    updated_at = NOW()
WHERE id IN (
    -- 7.2 Competence (ISO 27001)
    '86e1de90-d1d1-4c3e-a3f2-37505f990bb7',
    -- 6.1 Screening (ISO 27002)  
    '4e937648-7ec3-46d9-bfe7-9cb184c38dac',
    -- 6.2 Terms and conditions of employment (ISO 27002)
    '51b1b13b-4b38-4c33-9479-c3187268b8f4',
    -- 6.4 Disciplinary process (ISO 27002)
    'f48dd1a3-ba85-4f04-9ccf-77a7e9b7c256',
    -- 6.5 Responsibilities after termination or change of employment (ISO 27002)
    '88259720-21f6-4894-8b3e-1729fd0460bc'
);

-- Verify the updates were successful
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM requirements_library 
    WHERE id IN (
        '86e1de90-d1d1-4c3e-a3f2-37505f990bb7',
        '4e937648-7ec3-46d9-bfe7-9cb184c38dac',
        '51b1b13b-4b38-4c33-9479-c3187268b8f4',
        'f48dd1a3-ba85-4f04-9ccf-77a7e9b7c256',
        '88259720-21f6-4894-8b3e-1729fd0460bc'
    )
    AND category_id = 'a595ff1d-161c-4af6-8d7e-f9d47feeb525'::uuid;
    
    IF updated_count = 5 THEN
        RAISE NOTICE 'SUCCESS: All 5 requirements now properly assigned to Governance & Leadership category';
    ELSE
        RAISE NOTICE 'WARNING: Only % out of 5 requirements were updated', updated_count;
    END IF;
END $$;

-- Display the updated requirements for verification
SELECT 
    r.control_id,
    r.title,
    r.category as old_category_text,
    c.name as new_category_name,
    r.category_id
FROM requirements_library r
JOIN unified_compliance_categories c ON r.category_id = c.id
WHERE r.id IN (
    '86e1de90-d1d1-4c3e-a3f2-37505f990bb7',
    '4e937648-7ec3-46d9-bfe7-9cb184c38dac',
    '51b1b13b-4b38-4c33-9479-c3187268b8f4',
    'f48dd1a3-ba85-4f04-9ccf-77a7e9b7c256',
    '88259720-21f6-4894-8b3e-1729fd0460bc'
)
ORDER BY r.control_id;