-- Create assessment_requirements table for storing requirement status per assessment
-- This table links assessments to their requirement statuses with proper auditing

CREATE TABLE IF NOT EXISTS assessment_requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  requirement_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'not-fulfilled',
  notes TEXT,
  evidence TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique combination of assessment + requirement
  UNIQUE(assessment_id, requirement_id),
  
  -- Constraint to ensure valid status values
  CONSTRAINT valid_status CHECK (status IN ('fulfilled', 'partially-fulfilled', 'not-fulfilled', 'not-applicable'))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assessment_requirements_assessment_id ON assessment_requirements(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_requirements_status ON assessment_requirements(status);
CREATE INDEX IF NOT EXISTS idx_assessment_requirements_updated_at ON assessment_requirements(updated_at);

-- Add version column to assessments table for optimistic locking
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_assessment_requirements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS assessment_requirements_updated_at
  BEFORE UPDATE ON assessment_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_requirements_updated_at();

-- Create trigger to increment assessment version when requirements change
CREATE OR REPLACE FUNCTION increment_assessment_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment version in assessments table when requirement status changes
  UPDATE assessments 
  SET 
    version = version + 1,
    updated_at = NOW(),
    updated_by = NEW.updated_by
  WHERE id = NEW.assessment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS assessment_requirements_version_trigger
  AFTER INSERT OR UPDATE ON assessment_requirements
  FOR EACH ROW
  EXECUTE FUNCTION increment_assessment_version();

-- Enable Row Level Security
ALTER TABLE assessment_requirements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assessment_requirements
-- Users can only access requirements for assessments in their organization
CREATE POLICY "Users can view assessment requirements in their organization"
  ON assessment_requirements FOR SELECT
  USING (
    assessment_id IN (
      SELECT id FROM assessments 
      WHERE organization_id = (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can modify assessment requirements in their organization"
  ON assessment_requirements FOR ALL
  USING (
    assessment_id IN (
      SELECT id FROM assessments 
      WHERE organization_id = (
        SELECT organization_id FROM profiles 
        WHERE id = auth.uid()
      )
    )
  );

-- Grant necessary permissions
GRANT ALL ON assessment_requirements TO authenticated;
GRANT USAGE ON SEQUENCE assessment_requirements_id_seq TO authenticated;

-- Add helpful comments
COMMENT ON TABLE assessment_requirements IS 'Stores requirement statuses for each assessment with audit trail';
COMMENT ON COLUMN assessment_requirements.assessment_id IS 'Foreign key to assessments table';
COMMENT ON COLUMN assessment_requirements.requirement_id IS 'ID of the requirement from requirements_library';
COMMENT ON COLUMN assessment_requirements.status IS 'Current status: fulfilled, partially-fulfilled, not-fulfilled, not-applicable';
COMMENT ON COLUMN assessment_requirements.notes IS 'Assessor notes for this requirement';
COMMENT ON COLUMN assessment_requirements.evidence IS 'Evidence provided for this requirement';
COMMENT ON COLUMN assessment_requirements.updated_by IS 'User who last updated this requirement';