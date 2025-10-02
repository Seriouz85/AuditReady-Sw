-- Migration: Create RPC function to query auth.users
-- Created: 2025-10-01
-- Purpose: Allow platform administrators to query auth.users directly via RPC

-- Create a secure RPC function that platform admins can use to get all auth users
CREATE OR REPLACE FUNCTION get_all_auth_users()
RETURNS SETOF auth.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Verify the calling user is a platform administrator
  IF NOT EXISTS (
    SELECT 1
    FROM platform_administrators
    WHERE email = auth.jwt()->>'email'
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Platform administrator access required';
  END IF;

  -- Return all users from auth.users
  RETURN QUERY
  SELECT * FROM auth.users
  ORDER BY created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users (RLS will verify admin status)
GRANT EXECUTE ON FUNCTION get_all_auth_users() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION get_all_auth_users() IS 'Returns all auth.users for platform administrators only. Includes security check.';
