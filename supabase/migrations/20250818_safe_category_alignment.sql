-- Safe Category Alignment Migration
-- This migration ONLY adds missing data without removing or changing existing data
-- Goal: Ensure all requirements have proper category_id while keeping text field intact

-- Step 1: Add any missing categories to unified_compliance_categories
-- These are categories found in requirements_library.category but not in unified
INSERT INTO unified_compliance_categories (id, name, description, sort_order, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Access Control', 'Access control and authentication mechanisms', 22, NOW(), NOW()),
  (gen_random_uuid(), 'Asset Management', 'Hardware and software asset management', 23, NOW(), NOW()),
  (gen_random_uuid(), 'Business Continuity', 'Business continuity planning and disaster recovery', 24, NOW(), NOW()),
  (gen_random_uuid(), 'Configuration Management', 'System and application configuration management', 25, NOW(), NOW()),
  (gen_random_uuid(), 'Incident Response', 'Incident detection, response, and recovery', 26, NOW(), NOW()),
  (gen_random_uuid(), 'Logging & Monitoring', 'System logging and monitoring controls', 27, NOW(), NOW()),
  (gen_random_uuid(), 'Malware Defense', 'Malware prevention and defense mechanisms', 28, NOW(), NOW()),
  (gen_random_uuid(), 'Network Security', 'Network security controls and segmentation', 29, NOW(), NOW()),
  (gen_random_uuid(), 'Organizational controls', 'Organizational and administrative controls', 30, NOW(), NOW()),
  (gen_random_uuid(), 'People controls', 'Personnel security and awareness controls', 31, NOW(), NOW()),
  (gen_random_uuid(), 'Physical controls', 'Physical and environmental security controls', 32, NOW(), NOW()),
  (gen_random_uuid(), 'Secure Development', 'Secure software development practices', 33, NOW(), NOW()),
  (gen_random_uuid(), 'Security Awareness', 'Security training and awareness programs', 34, NOW(), NOW()),
  (gen_random_uuid(), 'Supplier Risk', 'Third-party and supplier risk management', 35, NOW(), NOW()),
  (gen_random_uuid(), 'Technological controls', 'Technical and technological security controls', 36, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create a mapping of all text categories to unified category IDs
WITH category_mapping AS (
  SELECT DISTINCT 
    rl.category as text_category,
    ucc.id as unified_id
  FROM requirements_library rl
  LEFT JOIN unified_compliance_categories ucc 
    ON LOWER(TRIM(rl.category)) = LOWER(TRIM(ucc.name))
  WHERE rl.category IS NOT NULL
)
-- Update all requirements to have the correct category_id based on their text category
UPDATE requirements_library rl
SET 
  category_id = cm.unified_id,
  updated_at = NOW()
FROM category_mapping cm
WHERE rl.category = cm.text_category
  AND cm.unified_id IS NOT NULL
  AND (rl.category_id IS NULL OR rl.category_id != cm.unified_id);

-- Step 3: Now handle our specific requirement updates with correct category_id
DO $$
DECLARE
  v_governance_id UUID;
  v_secure_dev_id UUID;
  v_audit_log_id UUID;
BEGIN
  -- Get the category IDs
  SELECT id INTO v_governance_id FROM unified_compliance_categories WHERE name = 'Governance & Leadership';
  SELECT id INTO v_secure_dev_id FROM unified_compliance_categories WHERE name = 'Secure Software Development';
  SELECT id INTO v_audit_log_id FROM unified_compliance_categories WHERE name = 'Audit Log Management';
  
  -- Update 5.11: Return of assets -> Governance & Leadership
  UPDATE requirements_library
  SET 
    category = 'Governance & Leadership',
    category_id = v_governance_id,
    updated_at = NOW()
  WHERE control_id = '5.11' AND title = 'Return of assets';
  
  -- Update 8.30: Outsourced development -> Secure Software Development
  UPDATE requirements_library
  SET 
    category = 'Secure Software Development',
    category_id = v_secure_dev_id,
    updated_at = NOW()
  WHERE control_id = '8.30' AND title = 'Outsourced development';
  
  -- Update 8.34: Protection of information systems during audit testing -> Audit Log Management
  UPDATE requirements_library
  SET 
    category = 'Audit Log Management',
    category_id = v_audit_log_id,
    updated_at = NOW()
  WHERE control_id = '8.34' AND title = 'Protection of information systems during audit testing';
  
  -- Update 8.4: Access to source code -> Secure Software Development
  UPDATE requirements_library
  SET 
    category = 'Secure Software Development',
    category_id = v_secure_dev_id,
    updated_at = NOW()
  WHERE control_id = '8.4' AND title = 'Access to source code';
END $$;

-- Step 4: Create a trigger to keep category text in sync with category_id
CREATE OR REPLACE FUNCTION sync_category_text()
RETURNS TRIGGER AS $$
BEGIN
  -- When category_id changes, update the text field to match
  IF NEW.category_id IS DISTINCT FROM OLD.category_id THEN
    SELECT name INTO NEW.category
    FROM unified_compliance_categories
    WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'sync_category_text_on_update'
  ) THEN
    CREATE TRIGGER sync_category_text_on_update
    BEFORE UPDATE ON requirements_library
    FOR EACH ROW
    WHEN (NEW.category_id IS DISTINCT FROM OLD.category_id)
    EXECUTE FUNCTION sync_category_text();
  END IF;
END $$;

-- Step 5: Verification queries
DO $$
DECLARE
  v_total_requirements INTEGER;
  v_requirements_with_category_id INTEGER;
  v_requirements_with_matching_text INTEGER;
BEGIN
  -- Count total requirements
  SELECT COUNT(*) INTO v_total_requirements FROM requirements_library;
  
  -- Count requirements with category_id
  SELECT COUNT(*) INTO v_requirements_with_category_id 
  FROM requirements_library 
  WHERE category_id IS NOT NULL;
  
  -- Count requirements where text matches category name
  SELECT COUNT(*) INTO v_requirements_with_matching_text
  FROM requirements_library rl
  JOIN unified_compliance_categories ucc ON rl.category_id = ucc.id
  WHERE rl.category = ucc.name;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE 'Total requirements: %', v_total_requirements;
  RAISE NOTICE 'Requirements with category_id: % (% %%)', 
    v_requirements_with_category_id, 
    ROUND((v_requirements_with_category_id::NUMERIC / v_total_requirements) * 100, 2);
  RAISE NOTICE 'Requirements with matching text/id: % (% %%)', 
    v_requirements_with_matching_text,
    ROUND((v_requirements_with_matching_text::NUMERIC / GREATEST(v_requirements_with_category_id, 1)) * 100, 2);
END $$;

-- Final verification for our specific requirements
SELECT 
  rl.control_id,
  rl.title,
  rl.category as category_text,
  ucc.name as category_from_id
FROM requirements_library rl
LEFT JOIN unified_compliance_categories ucc ON rl.category_id = ucc.id
WHERE rl.control_id IN ('5.11', '8.30', '8.34', '8.4')
  AND rl.title IN ('Return of assets', 'Outsourced development', 
                   'Protection of information systems during audit testing', 
                   'Access to source code')
ORDER BY rl.control_id;