-- ============================================================================
-- Fix Quiz Attempts Compatibility Migration
-- Addresses compatibility issues between service layer and database schema
-- ============================================================================

-- Add missing 'passed' column to quiz_attempts table
-- This column tracks whether the user passed the quiz based on the score
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS passed BOOLEAN DEFAULT false;

-- Update existing records to set passed based on score vs passing score
-- This handles any existing quiz attempts in the database
UPDATE quiz_attempts 
SET passed = (
  CASE 
    WHEN score IS NULL THEN false
    WHEN score >= (
      SELECT COALESCE(passing_score, 70) 
      FROM quizzes q 
      WHERE q.id = quiz_attempts.quiz_id
    ) THEN true 
    ELSE false 
  END
)
WHERE passed IS NULL;

-- Create function to automatically compute passed status
-- This ensures new quiz attempts automatically get the correct passed status
CREATE OR REPLACE FUNCTION compute_quiz_passed()
RETURNS TRIGGER AS $$
DECLARE
    quiz_passing_score INTEGER;
BEGIN
    -- Get the passing score for this quiz from the quiz content
    SELECT 
      COALESCE(
        (content->>'passingScore')::INTEGER,
        70  -- Default passing score if not specified
      ) INTO quiz_passing_score
    FROM learning_content lc
    INNER JOIN quizzes q ON q.learning_content_id = lc.id
    WHERE q.id = NEW.quiz_id;
    
    -- If no passing score found, try to get it from quiz metadata
    IF quiz_passing_score IS NULL THEN
      SELECT COALESCE(passing_score, 70) INTO quiz_passing_score
      FROM quizzes 
      WHERE id = NEW.quiz_id;
    END IF;
    
    -- Set passed based on score vs passing score
    NEW.passed := (NEW.score IS NOT NULL AND NEW.score >= COALESCE(quiz_passing_score, 70));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically compute passed status on insert/update
DROP TRIGGER IF EXISTS trigger_compute_quiz_passed ON quiz_attempts;
CREATE TRIGGER trigger_compute_quiz_passed
    BEFORE INSERT OR UPDATE ON quiz_attempts
    FOR EACH ROW
    EXECUTE FUNCTION compute_quiz_passed();

-- Add performance indexes for quiz scoring queries
-- These optimize common queries performed by the QuizService

-- Index for user's quiz analytics (getUserAverageScore method)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_scores 
ON quiz_attempts(user_id, quiz_id, score) 
WHERE completed_at IS NOT NULL;

-- Index for quiz analytics and reporting
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_analytics 
ON quiz_attempts(quiz_id, score, completed_at, passed) 
WHERE completed_at IS NOT NULL;

-- Index for user's best attempt queries (getBestAttempt method)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_best 
ON quiz_attempts(user_id, quiz_id, score DESC);

-- Index for passed attempts specifically (for certificate generation)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_passed 
ON quiz_attempts(user_id, quiz_id, passed, completed_at) 
WHERE passed = true;

-- Add comments for documentation
COMMENT ON COLUMN quiz_attempts.passed IS 'Automatically computed based on score vs quiz passing_score';
COMMENT ON TRIGGER trigger_compute_quiz_passed ON quiz_attempts IS 'Automatically sets passed=true/false based on score and quiz passing_score';

-- Verify the migration worked by checking if passed column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quiz_attempts' 
        AND column_name = 'passed'
    ) THEN
        RAISE EXCEPTION 'Migration failed: passed column was not added to quiz_attempts table';
    END IF;
    
    RAISE NOTICE 'Quiz attempts compatibility migration completed successfully';
END $$;