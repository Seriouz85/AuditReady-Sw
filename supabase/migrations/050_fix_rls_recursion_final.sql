-- Final fix for RLS infinite recursion in organization_users
-- This migration completely removes all recursive RLS policies and creates simple, bulletproof policies

-- Step 1: Drop ALL existing policies on organization_users to eliminate recursion
DROP POLICY IF EXISTS "demo_org_users_access" ON organization_users;
DROP POLICY IF EXISTS "Demo organization users bypass auth checks" ON organization_users;
DROP POLICY IF EXISTS "Demo organization can be accessed without auth" ON organization_users;
DROP POLICY IF EXISTS "Allow anonymous access to demo organization" ON organization_users;
DROP POLICY IF EXISTS "Users can see their own organization membership" ON organization_users;
DROP POLICY IF EXISTS "Users can update their own organization membership" ON organization_users;
DROP POLICY IF EXISTS "Organization owners can manage users" ON organization_users;
DROP POLICY IF EXISTS "Organization admins can view users" ON organization_users;
DROP POLICY IF EXISTS "Organization admins can manage users" ON organization_users;

-- Step 2: Create ONE simple policy for demo organization that doesn't reference other tables
CREATE POLICY "demo_org_public_access"
ON organization_users
FOR ALL
TO public
USING (organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid);

-- Step 3: Create simple policies for regular organizations that don't cause recursion
-- Policy for users to see their own membership
CREATE POLICY "users_own_membership"
ON organization_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy for users to update their own membership
CREATE POLICY "users_update_own_membership"
ON organization_users
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Step 4: Ensure demo organization standards and requirements policies are simple
DROP POLICY IF EXISTS "demo_org_standards_access" ON organization_standards;
CREATE POLICY "demo_org_standards_public"
ON organization_standards
FOR ALL
TO public
USING (organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid);

DROP POLICY IF EXISTS "demo_org_requirements_access" ON organization_requirements;
CREATE POLICY "demo_org_requirements_public"
ON organization_requirements
FOR ALL
TO public
USING (organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid);

-- Step 5: Add simple policies for regular organizations on standards and requirements
CREATE POLICY "org_standards_member_access"
ON organization_standards
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "org_requirements_member_access"
ON organization_requirements
FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Step 6: Ensure library tables are accessible
GRANT SELECT ON standards_library TO anon, authenticated;
GRANT SELECT ON requirements_library TO anon, authenticated;

-- Step 7: Add explicit demo user to avoid any user lookup issues
INSERT INTO organization_users (
  id,
  organization_id,
  user_id,
  role_id,
  status,
  is_active,
  created_at,
  updated_at
) 
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  (SELECT id FROM user_roles WHERE name = 'admin' LIMIT 1),
  'active',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  status = 'active',
  is_active = true,
  updated_at = NOW();

COMMENT ON POLICY "demo_org_public_access" ON organization_users IS 'Allows public access to demo organization without recursion';
COMMENT ON POLICY "demo_org_standards_public" ON organization_standards IS 'Allows public access to demo organization standards';
COMMENT ON POLICY "demo_org_requirements_public" ON organization_requirements IS 'Allows public access to demo organization requirements';