-- Migration: Add real-time collaboration support for requirements
-- This migration adds the necessary tables and columns for real-time collaboration

-- Add collaboration tracking columns to existing organization_requirements table
ALTER TABLE organization_requirements 
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES organization_users(id),
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES organization_users(id),
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP;

-- Create requirement collaborations table for tracking active sessions
CREATE TABLE IF NOT EXISTS requirement_collaborations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES requirements_library(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES organization_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('viewing', 'editing', 'commenting')),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create requirement activities table for detailed activity tracking
CREATE TABLE IF NOT EXISTS requirement_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  requirement_id UUID NOT NULL REFERENCES requirements_library(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES organization_users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'status_changed', 
    'evidence_added', 
    'evidence_removed',
    'notes_updated', 
    'assignee_changed',
    'due_date_changed',
    'priority_changed',
    'locked',
    'unlocked'
  )),
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_requirement_collaborations_org_req 
ON requirement_collaborations(organization_id, requirement_id);

CREATE INDEX IF NOT EXISTS idx_requirement_collaborations_user 
ON requirement_collaborations(user_id);

CREATE INDEX IF NOT EXISTS idx_requirement_collaborations_active 
ON requirement_collaborations(requirement_id) WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_requirement_activities_org_req 
ON requirement_activities(organization_id, requirement_id);

CREATE INDEX IF NOT EXISTS idx_requirement_activities_created_at 
ON requirement_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_organization_requirements_last_edited 
ON organization_requirements(last_edited_at DESC);

-- Add RLS policies for requirement_collaborations
ALTER TABLE requirement_collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborations in their organization" 
ON requirement_collaborations FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create collaborations in their organization" 
ON requirement_collaborations FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

CREATE POLICY "Users can update their own collaborations" 
ON requirement_collaborations FOR UPDATE 
USING (user_id = auth.uid());

-- Add RLS policies for requirement_activities
ALTER TABLE requirement_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities in their organization" 
ON requirement_activities FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create activities in their organization" 
ON requirement_activities FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id 
    FROM organization_users 
    WHERE user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for requirement_collaborations
CREATE TRIGGER update_requirement_collaborations_updated_at 
BEFORE UPDATE ON requirement_collaborations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up ended collaborations periodically
CREATE OR REPLACE FUNCTION cleanup_ended_collaborations()
RETURNS void AS $$
BEGIN
  -- Remove collaborations that ended more than 24 hours ago
  DELETE FROM requirement_collaborations 
  WHERE ended_at IS NOT NULL 
  AND ended_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to automatically end stale collaborations
CREATE OR REPLACE FUNCTION end_stale_collaborations()
RETURNS void AS $$
BEGIN
  -- End collaborations that haven't been updated in 30 minutes
  UPDATE requirement_collaborations 
  SET ended_at = NOW()
  WHERE ended_at IS NULL 
  AND updated_at < NOW() - INTERVAL '30 minutes';
END;
$$ LANGUAGE plpgsql;