-- ============================================================================
-- Optimize Demo Login Performance
-- Create database function for efficient demo data initialization
-- ============================================================================

-- Create a function to efficiently set demo requirement statuses
-- This runs on the database side, avoiding network roundtrips
CREATE OR REPLACE FUNCTION set_demo_requirement_statuses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_org_id UUID := '34adc4bb-d1e7-43bd-8249-89c76520533d';
  total_count INT;
  fulfilled_count INT;
  partially_count INT;
  not_fulfilled_count INT;
BEGIN
  -- Get total count of requirements for demo org
  SELECT COUNT(*) INTO total_count
  FROM organization_requirements
  WHERE organization_id = demo_org_id;

  -- Calculate distribution
  fulfilled_count := FLOOR(total_count * 0.67); -- 67% fulfilled
  partially_count := FLOOR((total_count - fulfilled_count) * 0.5); -- 50% of remaining
  not_fulfilled_count := total_count - fulfilled_count - partially_count; -- Rest

  -- Use a single CTE to update all statuses efficiently
  WITH shuffled AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY RANDOM()) as rn
    FROM organization_requirements
    WHERE organization_id = demo_org_id
  ),
  status_assignments AS (
    SELECT 
      id,
      CASE 
        WHEN rn <= fulfilled_count THEN 'fulfilled'::requirement_status
        WHEN rn <= fulfilled_count + partially_count THEN 'partially-fulfilled'::requirement_status
        ELSE 'not-fulfilled'::requirement_status
      END as new_status,
      CASE 
        WHEN rn <= fulfilled_count THEN 100
        WHEN rn <= fulfilled_count + partially_count THEN FLOOR(RANDOM() * 60 + 20)::INT
        ELSE 0
      END as new_percentage,
      CASE 
        WHEN rn <= fulfilled_count THEN 'Fully implemented - demo data'
        WHEN rn <= fulfilled_count + partially_count THEN 'Implementation in progress - demo data'
        ELSE 'Pending implementation - demo data'
      END as new_notes
    FROM shuffled
  )
  UPDATE organization_requirements o
  SET 
    status = s.new_status,
    fulfillment_percentage = s.new_percentage,
    notes = s.new_notes,
    updated_at = NOW()
  FROM status_assignments s
  WHERE o.id = s.id;

  -- Log the update
  RAISE NOTICE 'Updated % demo requirements: % fulfilled, % partially-fulfilled, % not-fulfilled', 
    total_count, fulfilled_count, partially_count, not_fulfilled_count;
END;
$$;

-- Create an index to speed up demo organization queries
CREATE INDEX IF NOT EXISTS idx_org_requirements_demo 
ON organization_requirements(organization_id) 
WHERE organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d';

-- Create a function to check if demo data needs enhancement
CREATE OR REPLACE FUNCTION check_demo_enhancement_needed()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_org_id UUID := '34adc4bb-d1e7-43bd-8249-89c76520533d';
  last_update TIMESTAMP;
  fulfilled_count INT;
  total_count INT;
BEGIN
  -- Check when demo requirements were last updated
  SELECT MAX(updated_at) INTO last_update
  FROM organization_requirements
  WHERE organization_id = demo_org_id;

  -- If no updates or older than 7 days, needs enhancement
  IF last_update IS NULL OR last_update < NOW() - INTERVAL '7 days' THEN
    RETURN TRUE;
  END IF;

  -- Check if distribution is correct (should be ~67% fulfilled)
  SELECT 
    COUNT(*) FILTER (WHERE status = 'fulfilled'),
    COUNT(*)
  INTO fulfilled_count, total_count
  FROM organization_requirements
  WHERE organization_id = demo_org_id;

  -- If distribution is off by more than 5%, needs enhancement
  IF total_count > 0 AND ABS((fulfilled_count::FLOAT / total_count) - 0.67) > 0.05 THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Create a materialized view for demo dashboard stats (super fast reads)
CREATE MATERIALIZED VIEW IF NOT EXISTS demo_compliance_stats AS
SELECT 
  COUNT(*) as total_requirements,
  COUNT(*) FILTER (WHERE status = 'fulfilled') as fulfilled,
  COUNT(*) FILTER (WHERE status = 'partially-fulfilled') as partially_fulfilled,
  COUNT(*) FILTER (WHERE status = 'not-fulfilled') as not_fulfilled,
  COUNT(*) FILTER (WHERE status = 'not-applicable') as not_applicable,
  ROUND(COUNT(*) FILTER (WHERE status = 'fulfilled')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as compliance_percentage
FROM organization_requirements
WHERE organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d';

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_compliance_stats ON demo_compliance_stats (total_requirements);

-- Function to refresh demo stats (can be called periodically)
CREATE OR REPLACE FUNCTION refresh_demo_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY demo_compliance_stats;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION set_demo_requirement_statuses() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_demo_enhancement_needed() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_demo_stats() TO anon, authenticated;
GRANT SELECT ON demo_compliance_stats TO anon, authenticated;

-- Initial setup: Run the enhancement once
SELECT set_demo_requirement_statuses();
REFRESH MATERIALIZED VIEW demo_compliance_stats;