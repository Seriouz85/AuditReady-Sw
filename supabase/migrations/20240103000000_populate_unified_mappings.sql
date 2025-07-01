-- ============================================================================
-- Populate Unified Requirement Mappings
-- Links unified requirements to specific framework controls
-- ============================================================================

-- Helper function to get requirement ID by code
CREATE OR REPLACE FUNCTION get_requirement_id_by_code(req_code TEXT, standard_code TEXT)
RETURNS UUID AS $$
  SELECT r.id 
  FROM requirements_library r
  JOIN standards_library s ON r.standard_id = s.id
  WHERE r.requirement_code = req_code 
  AND s.code = standard_code
  LIMIT 1;
$$ LANGUAGE SQL;

-- Helper function to get unified requirement ID by title and category
CREATE OR REPLACE FUNCTION get_unified_requirement_id(req_title TEXT, cat_name TEXT)
RETURNS UUID AS $$
  SELECT ur.id 
  FROM unified_requirements ur
  JOIN unified_compliance_categories ucc ON ur.category_id = ucc.id
  WHERE ur.title = req_title 
  AND ucc.name = cat_name
  LIMIT 1;
$$ LANGUAGE SQL;

-- Populate mappings for Governance & Leadership
DO $$
DECLARE
  unified_req_id UUID;
  framework_req_id UUID;
BEGIN
  -- Get the unified requirement ID
  unified_req_id := get_unified_requirement_id('Information Security Governance & Leadership', 'Governance & Leadership');
  
  IF unified_req_id IS NOT NULL THEN
    -- Map ISO 27001 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27001') 
      FROM (VALUES ('4.1'), ('4.2'), ('4.3'), ('4.4'), ('5.1'), ('5.2'), ('5.3'), 
                   ('6.1.1'), ('6.1.2'), ('6.1.3'), ('6.2'), ('7.1'), ('7.2'), 
                   ('7.3'), ('7.4'), ('7.5.1'), ('7.5.2'), ('7.5.3'), ('8.1'), 
                   ('8.2'), ('8.3'), ('9.1'), ('9.2.1'), ('9.2.2'), ('9.3.1'), 
                   ('9.3.2'), ('9.3.3'), ('10.1'), ('10.2')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Core governance requirement')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map ISO 27002 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27002') 
      FROM (VALUES ('A.5.1'), ('A.5.2'), ('A.5.3'), ('A.5.4'), ('A.5.5'), 
                   ('A.5.6'), ('A.5.10'), ('A.5.11'), ('A.5.31'), ('A.5.32'), 
                   ('A.5.33'), ('A.5.36'), ('A.5.37')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Governance control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Populate mappings for Risk Management
DO $$
DECLARE
  unified_req_id UUID;
  framework_req_id UUID;
BEGIN
  unified_req_id := get_unified_requirement_id('Information Security Risk Management', 'Risk Management');
  
  IF unified_req_id IS NOT NULL THEN
    -- Map ISO 27001 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27001') 
      FROM (VALUES ('6.1.2'), ('6.1.3'), ('8.2'), ('8.3')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'exact', 'Direct risk management requirement')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map ISO 27002 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27002') 
      FROM (VALUES ('A.5.7'), ('A.5.8')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Risk assessment control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Populate mappings for Access Control
DO $$
DECLARE
  unified_req_id UUID;
  framework_req_id UUID;
BEGIN
  unified_req_id := get_unified_requirement_id('Identity & Access Management', 'Access Control');
  
  IF unified_req_id IS NOT NULL THEN
    -- Map ISO 27002 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27002') 
      FROM (VALUES ('A.5.15'), ('A.5.16'), ('A.5.17'), ('A.5.18'), ('A.8.2'), 
                   ('A.8.3'), ('A.8.4'), ('A.8.5')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'exact', 'Access control requirement')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map CIS Controls
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'CIS_v8') 
      FROM (VALUES ('5.1'), ('5.2'), ('5.3'), ('5.4'), ('5.5'), ('5.6'), 
                   ('6.1'), ('6.2'), ('6.3'), ('6.4'), ('6.5'), ('6.6'), 
                   ('6.7'), ('6.8')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Identity and access management control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Populate mappings for Data Protection
DO $$
DECLARE
  unified_req_id UUID;
  framework_req_id UUID;
BEGIN
  unified_req_id := get_unified_requirement_id('Data Protection & Cryptographic Controls', 'Data Protection');
  
  IF unified_req_id IS NOT NULL THEN
    -- Map ISO 27002 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27002') 
      FROM (VALUES ('A.5.12'), ('A.5.13'), ('A.5.14'), ('A.5.34'), ('A.5.35'), 
                   ('A.8.9'), ('A.8.10'), ('A.8.11'), ('A.8.12'), ('A.8.24')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'exact', 'Data protection control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map CIS Controls for DLP
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'CIS_v8') 
      FROM (VALUES ('3.1'), ('3.2'), ('3.3'), ('3.4'), ('3.5'), ('3.6'), 
                   ('3.7'), ('3.8'), ('3.9'), ('3.10'), ('3.11'), ('3.12'), 
                   ('3.13'), ('3.14')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Data loss prevention control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map GDPR requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'GDPR') 
      FROM (VALUES ('Art. 25'), ('Art. 32'), ('Art. 5')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Data protection principle')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Populate mappings for Physical Security
DO $$
DECLARE
  unified_req_id UUID;
  framework_req_id UUID;
BEGIN
  unified_req_id := get_unified_requirement_id('Physical & Environmental Security Controls', 'Physical Security');
  
  IF unified_req_id IS NOT NULL THEN
    -- Map ISO 27002 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27002') 
      FROM (VALUES ('A.7.1'), ('A.7.2'), ('A.7.3'), ('A.7.4'), ('A.7.5'), 
                   ('A.7.6'), ('A.7.7'), ('A.7.8'), ('A.7.9'), ('A.7.10'), 
                   ('A.7.11'), ('A.7.12'), ('A.7.13'), ('A.7.14')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'exact', 'Physical security control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Populate mappings for Network Security
DO $$
DECLARE
  unified_req_id UUID;
  framework_req_id UUID;
BEGIN
  unified_req_id := get_unified_requirement_id('Network Infrastructure Management', 'Network Security');
  
  IF unified_req_id IS NOT NULL THEN
    -- Map ISO 27002 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27002') 
      FROM (VALUES ('A.8.20'), ('A.8.21'), ('A.8.22'), ('A.8.23')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'exact', 'Network security control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map CIS Controls
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'CIS_v8') 
      FROM (VALUES ('12.1'), ('12.2'), ('12.3'), ('12.4'), ('12.5'), ('12.6'), 
                   ('12.7'), ('12.8')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Network infrastructure control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Populate mappings for Incident Response
DO $$
DECLARE
  unified_req_id UUID;
  framework_req_id UUID;
BEGIN
  unified_req_id := get_unified_requirement_id('Incident Response & Security Event Management', 'Incident Response');
  
  IF unified_req_id IS NOT NULL THEN
    -- Map ISO 27002 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27002') 
      FROM (VALUES ('A.5.24'), ('A.5.25'), ('A.5.26'), ('A.5.27'), ('A.5.28'), 
                   ('A.5.29'), ('A.5.30')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'exact', 'Incident management control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map CIS Controls
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'CIS_v8') 
      FROM (VALUES ('16.1'), ('16.2'), ('16.3'), ('16.4'), ('16.5'), ('16.6'), 
                   ('16.7'), ('16.8'), ('16.9'), ('16.10'), ('16.11'), ('16.12'), 
                   ('16.13'), ('16.14')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Incident response control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map NIS2 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'NIS2') 
      FROM (VALUES ('Art. 21(2)(b)')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Incident handling requirement')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map GDPR requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'GDPR') 
      FROM (VALUES ('Art. 33'), ('Art. 34')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'partial', 'Data breach notification')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Populate mappings for Vulnerability Management
DO $$
DECLARE
  unified_req_id UUID;
  framework_req_id UUID;
BEGIN
  unified_req_id := get_unified_requirement_id('Continuous Vulnerability Management', 'Vulnerability Management');
  
  IF unified_req_id IS NOT NULL THEN
    -- Map ISO 27002 requirements
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'ISO27002') 
      FROM (VALUES ('A.8.8'), ('A.8.19'), ('A.5.7')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'strong', 'Vulnerability management control')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
    
    -- Map CIS Controls
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'CIS_v8') 
      FROM (VALUES ('7.1'), ('7.2'), ('7.3'), ('7.4'), ('7.5'), ('7.6'), ('7.7')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'exact', 'Continuous vulnerability management')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Populate mappings for GDPR Unified Compliance
DO $$
DECLARE
  unified_req_id UUID;
  framework_req_id UUID;
BEGIN
  unified_req_id := get_unified_requirement_id('Comprehensive GDPR Data Protection Implementation', 'GDPR Unified Compliance');
  
  IF unified_req_id IS NOT NULL THEN
    -- Map all GDPR articles
    FOR framework_req_id IN 
      SELECT get_requirement_id_by_code(code, 'GDPR') 
      FROM (VALUES ('Art. 5'), ('Art. 6'), ('Art. 7'), ('Art. 8'), ('Art. 9'), 
                   ('Art. 12'), ('Art. 13'), ('Art. 14'), ('Art. 15'), ('Art. 16'), 
                   ('Art. 17'), ('Art. 18'), ('Art. 20'), ('Art. 21'), ('Art. 22'), 
                   ('Art. 24'), ('Art. 25'), ('Art. 28'), ('Art. 30'), ('Art. 32'), 
                   ('Art. 33'), ('Art. 34'), ('Art. 35'), ('Art. 36'), ('Art. 37'), 
                   ('Art. 44'), ('Art. 46'), ('Art. 47'), ('Art. 48'), ('Art. 49')) AS t(code)
    LOOP
      IF framework_req_id IS NOT NULL THEN
        INSERT INTO unified_requirement_mappings 
          (unified_requirement_id, requirement_id, mapping_strength, notes)
        VALUES 
          (unified_req_id, framework_req_id, 'exact', 'GDPR compliance requirement')
        ON CONFLICT (unified_requirement_id, requirement_id) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Add more mapping population logic for other categories as needed...

-- Clean up helper functions
DROP FUNCTION IF EXISTS get_requirement_id_by_code(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_unified_requirement_id(TEXT, TEXT);

-- Create an index to improve mapping query performance
CREATE INDEX IF NOT EXISTS idx_unified_mappings_strength ON unified_requirement_mappings(mapping_strength);

-- Add comment for documentation
COMMENT ON TABLE unified_requirement_mappings IS 'Populated mappings between unified requirements and framework-specific requirements';