-- ============================================================================
-- Add Application Tags to ISO 27002 and CIS Control Requirements
-- Adds 'tag-application' to requirements that apply to applications/systems
-- ============================================================================

-- Ensure the tags column exists on requirements_library
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requirements_library' AND column_name = 'tags') THEN
        ALTER TABLE requirements_library ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Added tags column to requirements_library table';
    ELSE
        RAISE NOTICE 'Tags column already exists in requirements_library table';
    END IF;
END $$;

-- Update ISO 27002 requirements that apply to applications/systems
-- 8.11 - Data masking
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.11'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.12 - Data leakage prevention  
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.12'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.25 - Secure Development Life Cycle
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.25'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.26 - Application Security Requirements
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.26'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.27 - Secure System Architecture
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.27'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.28 - Secure Coding
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.28'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- Add additional ISO 27002 requirements that also apply to applications
-- 8.1 - User endpoint devices
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.1'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.5 - Secure authentication
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.5'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.7 - Protection against malware  
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.7'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.8 - Management of technical vulnerabilities
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.8'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.29 - Security testing in development and acceptance
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.29'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- 8.31 - Separation of development, testing and operational environments
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%ISO%27002%')
  AND control_id = '8.31'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- Update CIS Controls that apply to applications
-- CIS Control 16.1 - Secure Application Development Process  
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%CIS%Controls%')
  AND control_id = '16.1'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- Additional CIS Controls that apply to applications
-- CIS Control 16.2 - Manage Specific Vulnerabilities
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%CIS%Controls%')
  AND control_id = '16.2'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- CIS Control 16.3 - Secure Coding Practices
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%CIS%Controls%')
  AND control_id = '16.3'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- CIS Control 16.4 - Secure Application Testing
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%CIS%Controls%')
  AND control_id = '16.4'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- CIS Control 16.5 - Application Configuration Management
UPDATE requirements_library 
SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || ARRAY['tag-application']::TEXT[],
    updated_at = NOW()
WHERE standard_id = (SELECT id FROM standards_library WHERE name ILIKE '%CIS%Controls%')
  AND control_id = '16.5'
  AND NOT ('tag-application' = ANY(COALESCE(tags, ARRAY[]::TEXT[])));

-- Display results
DO $$
DECLARE
    iso_count INTEGER;
    cis_count INTEGER;
    total_count INTEGER;
BEGIN
    -- Count ISO 27002 requirements with application tag
    SELECT COUNT(*) INTO iso_count
    FROM requirements_library rl
    JOIN standards_library sl ON rl.standard_id = sl.id
    WHERE sl.name ILIKE '%ISO%27002%'
      AND 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]));
    
    -- Count CIS Controls with application tag  
    SELECT COUNT(*) INTO cis_count
    FROM requirements_library rl
    JOIN standards_library sl ON rl.standard_id = sl.id
    WHERE sl.name ILIKE '%CIS%Controls%'
      AND 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]));
    
    total_count := iso_count + cis_count;
    
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'APPLICATION TAGGING RESULTS:';
    RAISE NOTICE '• ISO 27002 requirements tagged: %', iso_count;
    RAISE NOTICE '• CIS Controls tagged: %', cis_count;
    RAISE NOTICE '• Total application requirements: %', total_count;
    RAISE NOTICE '============================================================================';
    
    -- List the tagged ISO 27002 requirements
    RAISE NOTICE 'ISO 27002 requirements now tagged as "Applies to: Applications/Systems":';
    FOR rec IN 
        SELECT rl.control_id, rl.title
        FROM requirements_library rl
        JOIN standards_library sl ON rl.standard_id = sl.id
        WHERE sl.name ILIKE '%ISO%27002%'
          AND 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]))
        ORDER BY rl.control_id
    LOOP
        RAISE NOTICE '  → % - %', rec.control_id, rec.title;
    END LOOP;
    
    -- List the tagged CIS Controls
    RAISE NOTICE 'CIS Controls now tagged as "Applies to: Applications/Systems":';
    FOR rec IN 
        SELECT rl.control_id, rl.title
        FROM requirements_library rl
        JOIN standards_library sl ON rl.standard_id = sl.id
        WHERE sl.name ILIKE '%CIS%Controls%'
          AND 'tag-application' = ANY(COALESCE(rl.tags, ARRAY[]::TEXT[]))
        ORDER BY rl.control_id
    LOOP
        RAISE NOTICE '  → % - %', rec.control_id, rec.title;
    END LOOP;
END $$;