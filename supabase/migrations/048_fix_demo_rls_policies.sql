-- Fix RLS policies for demo organization to avoid infinite recursion

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Allow anonymous access to demo organization" ON organization_users;
DROP POLICY IF EXISTS "Demo organization can be accessed without auth" ON organization_users;

-- Create a simple policy for demo organization users that doesn't reference itself
CREATE POLICY "Demo organization users bypass auth checks"
ON organization_users
FOR ALL 
TO public
USING (organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid);

-- Ensure demo organization standards can be accessed
DROP POLICY IF EXISTS "Demo organization standards bypass auth" ON organization_standards;
CREATE POLICY "Demo organization standards bypass auth"
ON organization_standards
FOR ALL
TO public
USING (organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid);

-- Ensure demo organization requirements can be accessed
DROP POLICY IF EXISTS "Demo organization requirements bypass auth" ON organization_requirements;
CREATE POLICY "Demo organization requirements bypass auth"
ON organization_requirements
FOR ALL
TO public
USING (organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid);

-- Add a demo user to organization_users if it doesn't exist
INSERT INTO organization_users (
  organization_id,
  user_id,
  role_id,
  is_active
) 
SELECT 
  '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid, -- Demo user UUID
  (SELECT id FROM user_roles WHERE name = 'admin' LIMIT 1),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM organization_users 
  WHERE organization_id = '34adc4bb-d1e7-43bd-8249-89c76520533d'::uuid
  AND user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- Ensure standards_library can be read by everyone
GRANT SELECT ON standards_library TO anon, authenticated;

-- Ensure requirements_library can be read by everyone  
GRANT SELECT ON requirements_library TO anon, authenticated;