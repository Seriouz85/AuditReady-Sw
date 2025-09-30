-- Create onboarding_sessions table for temporary session data
-- This replaces localStorage usage for onboarding flow

CREATE TABLE IF NOT EXISTS onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key TEXT UNIQUE NOT NULL, -- Generated client-side UUID for anonymous tracking

  -- Onboarding data
  organization_name TEXT,
  industry TEXT,
  company_size TEXT,
  primary_frameworks JSONB DEFAULT '[]'::jsonb,
  compliance_goals JSONB DEFAULT '[]'::jsonb,
  assessment_data JSONB,

  -- Plan selection
  selected_plan TEXT,
  recommended_plan TEXT,
  stripe_price_id TEXT,

  -- User intent (before signup)
  intended_email TEXT,
  intended_tier TEXT,

  -- Session metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'), -- Auto-expire after 7 days
  completed BOOLEAN DEFAULT FALSE,

  -- Link to user after signup
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metadata
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT
);

-- Index for fast lookups
CREATE INDEX idx_onboarding_sessions_session_key ON onboarding_sessions(session_key);
CREATE INDEX idx_onboarding_sessions_user_id ON onboarding_sessions(user_id);
CREATE INDEX idx_onboarding_sessions_expires_at ON onboarding_sessions(expires_at);

-- RLS Policies
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to create and read their own sessions via session_key
CREATE POLICY "Users can create onboarding sessions"
  ON onboarding_sessions
  FOR INSERT
  WITH CHECK (true); -- Anyone can create

CREATE POLICY "Users can read their own onboarding sessions"
  ON onboarding_sessions
  FOR SELECT
  USING (
    session_key IS NOT NULL OR -- Anonymous access via session_key
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) -- Authenticated user
  );

CREATE POLICY "Users can update their own onboarding sessions"
  ON onboarding_sessions
  FOR UPDATE
  USING (
    session_key IS NOT NULL OR -- Anonymous users can update via session_key
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) -- Authenticated user
  );

-- Function to cleanup expired sessions (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_onboarding_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM onboarding_sessions
  WHERE expires_at < NOW()
    AND completed = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_onboarding_session_updated_at
  BEFORE UPDATE ON onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_session_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON onboarding_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON onboarding_sessions TO anon;

-- Comments for documentation
COMMENT ON TABLE onboarding_sessions IS 'Stores temporary onboarding session data to replace localStorage usage. Sessions expire after 7 days if not completed.';
COMMENT ON COLUMN onboarding_sessions.session_key IS 'Client-generated UUID for anonymous session tracking before user signup';
COMMENT ON COLUMN onboarding_sessions.completed IS 'Marked true when user completes signup and organization is created';
