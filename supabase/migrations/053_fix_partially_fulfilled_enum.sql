-- ============================================================================
-- Fix partially-fulfilled enum value issue
-- 
-- The requirement_status enum appears to have an issue with 'partially-fulfilled'
-- This migration ensures the enum value exists and is properly formatted
-- ============================================================================

-- First, check if the enum value exists
DO $$
BEGIN
  -- Check if 'partially-fulfilled' exists in the enum
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_enum 
    WHERE enumlabel = 'partially-fulfilled' 
    AND enumtypid = 'requirement_status'::regtype
  ) THEN
    -- Add the value if it doesn't exist
    ALTER TYPE requirement_status ADD VALUE IF NOT EXISTS 'partially-fulfilled' AFTER 'fulfilled';
  END IF;
END
$$;

-- Create a function to safely update status values
CREATE OR REPLACE FUNCTION update_requirement_status_safe(
  p_requirement_id UUID,
  p_status TEXT,
  p_fulfillment_percentage INTEGER DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_valid_status requirement_status;
BEGIN
  -- Validate the status value
  BEGIN
    v_valid_status := p_status::requirement_status;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Invalid status value: %', p_status;
      RETURN FALSE;
  END;
  
  -- Perform the update
  UPDATE organization_requirements
  SET 
    status = v_valid_status,
    fulfillment_percentage = COALESCE(p_fulfillment_percentage, fulfillment_percentage),
    notes = COALESCE(p_notes, notes),
    updated_at = NOW()
  WHERE id = p_requirement_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_requirement_status_safe TO authenticated;

-- Add a comment explaining the issue
COMMENT ON TYPE requirement_status IS 'Requirement fulfillment status. Note: partially-fulfilled has had constraint issues - use update_requirement_status_safe() function for safe updates.';