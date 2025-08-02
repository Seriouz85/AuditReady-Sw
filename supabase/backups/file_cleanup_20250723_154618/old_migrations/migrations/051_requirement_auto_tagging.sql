-- Auto-tagging system for requirements based on content and categories
-- This ensures all requirements get appropriate tags automatically

-- Step 1: Create default tags for requirement categorization
INSERT INTO tags (id, name, color, description, category) VALUES
  -- Technical implementation tags
  ('tag-technical', 'Technical', '#3B82F6', 'Technical implementation requirements', 'type'),
  ('tag-policy', 'Policy', '#8B5CF6', 'Policy and governance requirements', 'type'),
  ('tag-documentation', 'Documentation', '#10B981', 'Documentation and record-keeping requirements', 'type'),
  ('tag-training', 'Training', '#F59E0B', 'Training and awareness requirements', 'type'),
  ('tag-monitoring', 'Monitoring', '#EF4444', 'Monitoring and assessment requirements', 'type'),
  ('tag-incident', 'Incident Response', '#EC4899', 'Incident response and management requirements', 'type'),
  
  -- Risk level tags
  ('tag-high-risk', 'High Risk', '#DC2626', 'High-risk security requirements', 'applies-to'),
  ('tag-medium-risk', 'Medium Risk', '#D97706', 'Medium-risk requirements', 'applies-to'),
  ('tag-low-risk', 'Low Risk', '#059669', 'Low-risk requirements', 'applies-to'),
  
  -- Asset type tags
  ('tag-network', 'Network', '#2563EB', 'Network security requirements', 'applies-to'),
  ('tag-endpoint', 'Endpoint', '#7C3AED', 'Endpoint security requirements', 'applies-to'),
  ('tag-data', 'Data Protection', '#0891B2', 'Data protection and privacy requirements', 'applies-to'),
  ('tag-access', 'Access Control', '#C2410C', 'Access control and identity management', 'applies-to'),
  ('tag-physical', 'Physical Security', '#4338CA', 'Physical security requirements', 'applies-to'),
  ('tag-cloud', 'Cloud Security', '#0D9488', 'Cloud security requirements', 'applies-to')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Step 2: Auto-tag function that analyzes requirement content and assigns appropriate tags
CREATE OR REPLACE FUNCTION auto_tag_requirement(req_id UUID, req_title TEXT, req_description TEXT, req_category TEXT)
RETURNS UUID[] AS $$
DECLARE
  tag_ids UUID[] := '{}';
  content_lower TEXT;
BEGIN
  -- Combine title and description for analysis
  content_lower := LOWER(req_title || ' ' || COALESCE(req_description, ''));
  
  -- Type-based tagging
  IF content_lower ~ '(technical|implement|configure|install|deploy|system|software|hardware)' THEN
    tag_ids := array_append(tag_ids, 'tag-technical');
  END IF;
  
  IF content_lower ~ '(policy|procedure|governance|management|establish|define|document)' THEN
    tag_ids := array_append(tag_ids, 'tag-policy');
  END IF;
  
  IF content_lower ~ '(document|record|maintain|log|report|evidence|retain)' THEN
    tag_ids := array_append(tag_ids, 'tag-documentation');
  END IF;
  
  IF content_lower ~ '(train|awareness|education|competence|skill|knowledge)' THEN
    tag_ids := array_append(tag_ids, 'tag-training');
  END IF;
  
  IF content_lower ~ '(monitor|assess|review|audit|test|evaluate|measure)' THEN
    tag_ids := array_append(tag_ids, 'tag-monitoring');
  END IF;
  
  IF content_lower ~ '(incident|emergency|response|recovery|contingency|crisis)' THEN
    tag_ids := array_append(tag_ids, 'tag-incident');
  END IF;
  
  -- Asset type tagging
  IF content_lower ~ '(network|firewall|router|switch|vpn|dns|connection)' THEN
    tag_ids := array_append(tag_ids, 'tag-network');
  END IF;
  
  IF content_lower ~ '(endpoint|workstation|laptop|mobile|device|antivirus)' THEN
    tag_ids := array_append(tag_ids, 'tag-endpoint');
  END IF;
  
  IF content_lower ~ '(data|information|privacy|personal|sensitive|confidential|encryption)' THEN
    tag_ids := array_append(tag_ids, 'tag-data');
  END IF;
  
  IF content_lower ~ '(access|authentication|authorization|identity|user|account|privilege)' THEN
    tag_ids := array_append(tag_ids, 'tag-access');
  END IF;
  
  IF content_lower ~ '(physical|facility|premises|building|server room|datacenter)' THEN
    tag_ids := array_append(tag_ids, 'tag-physical');
  END IF;
  
  IF content_lower ~ '(cloud|aws|azure|saas|iaas|paas|service provider)' THEN
    tag_ids := array_append(tag_ids, 'tag-cloud');
  END IF;
  
  -- Risk level tagging based on keywords
  IF content_lower ~ '(critical|essential|vital|mandatory|must|shall|required)' THEN
    tag_ids := array_append(tag_ids, 'tag-high-risk');
  ELSIF content_lower ~ '(important|should|recommended|significant)' THEN
    tag_ids := array_append(tag_ids, 'tag-medium-risk');
  ELSE
    tag_ids := array_append(tag_ids, 'tag-low-risk');
  END IF;
  
  -- Ensure at least one tag is assigned
  IF array_length(tag_ids, 1) IS NULL THEN
    tag_ids := array_append(tag_ids, 'tag-technical');
  END IF;
  
  RETURN tag_ids;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Update all existing organization requirements with auto-generated tags
DO $$
DECLARE
  org_req RECORD;
  computed_tags UUID[];
BEGIN
  FOR org_req IN 
    SELECT or_tbl.id, or_tbl.requirement_id, rl.title, rl.description, rl.category
    FROM organization_requirements or_tbl
    JOIN requirements_library rl ON or_tbl.requirement_id = rl.id
    WHERE or_tbl.tags IS NULL OR array_length(or_tbl.tags, 1) = 0
  LOOP
    -- Compute tags for this requirement
    computed_tags := auto_tag_requirement(
      org_req.requirement_id, 
      org_req.title, 
      org_req.description, 
      org_req.category
    );
    
    -- Update the organization requirement with computed tags
    UPDATE organization_requirements 
    SET tags = computed_tags
    WHERE id = org_req.id;
  END LOOP;
  
  RAISE NOTICE 'Auto-tagging completed for all organization requirements';
END $$;

-- Step 4: Create trigger to auto-tag new requirements when they're added
CREATE OR REPLACE FUNCTION trigger_auto_tag_requirement()
RETURNS TRIGGER AS $$
DECLARE
  req_info RECORD;
  computed_tags UUID[];
BEGIN
  -- Get requirement details
  SELECT title, description, category 
  INTO req_info
  FROM requirements_library 
  WHERE id = NEW.requirement_id;
  
  -- Only auto-tag if no tags are provided
  IF NEW.tags IS NULL OR array_length(NEW.tags, 1) = 0 THEN
    computed_tags := auto_tag_requirement(
      NEW.requirement_id,
      req_info.title,
      req_info.description,
      req_info.category
    );
    NEW.tags := computed_tags;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS auto_tag_requirement_trigger ON organization_requirements;
CREATE TRIGGER auto_tag_requirement_trigger
  BEFORE INSERT ON organization_requirements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_tag_requirement();

COMMENT ON FUNCTION auto_tag_requirement IS 'Automatically assigns relevant tags to requirements based on content analysis';
COMMENT ON FUNCTION trigger_auto_tag_requirement IS 'Trigger function to auto-tag requirements when inserted';