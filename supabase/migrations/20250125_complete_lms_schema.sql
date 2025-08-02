-- ============================================================================
-- Complete LMS Schema Implementation for Pro-Grade Learning Management
-- Phase 1.1: Foundation & Data Layer
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. LEARNING PATHS (COURSES)
-- ============================================================================

CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category VARCHAR(50) NOT NULL DEFAULT 'custom' CHECK (category IN ('security', 'compliance', 'technical', 'soft-skills', 'custom')),
  difficulty_level VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER DEFAULT 0 CHECK (estimated_duration_minutes >= 0),
  total_modules INTEGER DEFAULT 0 CHECK (total_modules >= 0),
  is_published BOOLEAN DEFAULT false,
  is_mandatory BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  cover_image_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  prerequisites UUID[] DEFAULT ARRAY[]::UUID[], -- Array of prerequisite learning path IDs
  learning_objectives TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_audience TEXT,
  language VARCHAR(10) DEFAULT 'en',
  version VARCHAR(20) DEFAULT '1.0',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_learning_paths_organization ON learning_paths(organization_id);
CREATE INDEX idx_learning_paths_category ON learning_paths(category);
CREATE INDEX idx_learning_paths_status ON learning_paths(status, is_published);
CREATE INDEX idx_learning_paths_created_by ON learning_paths(created_by);
CREATE INDEX idx_learning_paths_search ON learning_paths USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- 2. LEARNING CONTENT (CHAPTERS/LESSONS)
-- ============================================================================

CREATE TABLE learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES learning_content(id) ON DELETE CASCADE, -- For nested content structure
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'document', 'quiz', 'simulation', 'interactive', 'text', 'assignment', 'scorm', 'h5p')),
  content JSONB DEFAULT '{}', -- Flexible content based on type
  sequence INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 0 CHECK (duration_minutes >= 0),
  is_mandatory BOOLEAN DEFAULT true,
  is_preview BOOLEAN DEFAULT false, -- Can be viewed without enrollment
  resource_url TEXT, -- For videos, documents, external resources
  resource_metadata JSONB DEFAULT '{}', -- File size, format, etc.
  completion_criteria JSONB DEFAULT '{}', -- How completion is determined
  passing_score INTEGER DEFAULT NULL CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INTEGER DEFAULT NULL CHECK (max_attempts > 0),
  time_limit_minutes INTEGER DEFAULT NULL CHECK (time_limit_minutes > 0),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_learning_content_path ON learning_content(learning_path_id);
CREATE INDEX idx_learning_content_sequence ON learning_content(learning_path_id, sequence);
CREATE INDEX idx_learning_content_type ON learning_content(content_type);
CREATE INDEX idx_learning_content_parent ON learning_content(parent_id);

-- ============================================================================
-- 3. COURSE ENROLLMENTS
-- ============================================================================

CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  enrollment_type VARCHAR(20) DEFAULT 'self' CHECK (enrollment_type IN ('self', 'assigned', 'mandatory', 'bulk')),
  enrolled_by UUID, -- User who enrolled them (for assignments)
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped', 'expired')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  total_time_spent_minutes INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_score INTEGER DEFAULT NULL CHECK (completion_score >= 0 AND completion_score <= 100),
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Prevent duplicate enrollments
  UNIQUE(user_id, learning_path_id)
);

-- Indexes
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_path ON course_enrollments(learning_path_id);
CREATE INDEX idx_enrollments_org ON course_enrollments(organization_id);
CREATE INDEX idx_enrollments_status ON course_enrollments(status);
CREATE INDEX idx_enrollments_due_date ON course_enrollments(due_date) WHERE due_date IS NOT NULL;

-- ============================================================================
-- 4. USER LEARNING PROGRESS
-- ============================================================================

CREATE TABLE user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  content_id UUID REFERENCES learning_content(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_spent_minutes INTEGER DEFAULT 0 CHECK (time_spent_minutes >= 0),
  session_count INTEGER DEFAULT 0,
  
  -- Completion tracking
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  first_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Attempt tracking
  attempt_count INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT NULL CHECK (best_score >= 0 AND best_score <= 100),
  latest_score INTEGER DEFAULT NULL CHECK (latest_score >= 0 AND latest_score <= 100),
  
  -- Additional data
  bookmarks JSONB DEFAULT '[]',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Prevent duplicate progress entries
  UNIQUE(user_id, content_id),
  
  -- Ensure we have either learning_path_id OR content_id
  CHECK (learning_path_id IS NOT NULL OR content_id IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_progress_user ON user_learning_progress(user_id);
CREATE INDEX idx_progress_enrollment ON user_learning_progress(enrollment_id);
CREATE INDEX idx_progress_content ON user_learning_progress(content_id);
CREATE INDEX idx_progress_path ON user_learning_progress(learning_path_id);
CREATE INDEX idx_progress_completion ON user_learning_progress(is_completed, completed_at);

-- ============================================================================
-- 5. QUIZZES AND ASSESSMENTS
-- ============================================================================

CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_content_id UUID NOT NULL REFERENCES learning_content(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Quiz settings
  passing_score INTEGER DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  max_attempts INTEGER DEFAULT NULL CHECK (max_attempts > 0),
  time_limit_minutes INTEGER DEFAULT NULL CHECK (time_limit_minutes > 0),
  shuffle_questions BOOLEAN DEFAULT false,
  shuffle_answers BOOLEAN DEFAULT false,
  show_correct_answers BOOLEAN DEFAULT true,
  show_explanations BOOLEAN DEFAULT true,
  allow_review BOOLEAN DEFAULT true,
  
  -- Availability
  available_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  available_until TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  total_questions INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  difficulty_level VARCHAR(20) DEFAULT 'intermediate',
  estimated_duration_minutes INTEGER DEFAULT 15,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quizzes_content ON quizzes(learning_content_id);
CREATE INDEX idx_quizzes_org ON quizzes(organization_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);

-- ============================================================================
-- 6. QUIZ QUESTIONS
-- ============================================================================

CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Question content
  question_text TEXT NOT NULL,
  question_type VARCHAR(30) NOT NULL CHECK (question_type IN (
    'multiple_choice', 'multiple_select', 'true_false', 'short_answer', 
    'long_answer', 'fill_blank', 'matching', 'ordering', 'numerical'
  )),
  
  -- Answer options (JSON structure varies by question type)
  options JSONB DEFAULT '[]',
  correct_answers JSONB NOT NULL,
  explanation TEXT,
  
  -- Scoring
  points INTEGER DEFAULT 1 CHECK (points > 0),
  negative_marking BOOLEAN DEFAULT false,
  partial_credit BOOLEAN DEFAULT false,
  
  -- Ordering and categorization
  sequence INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty_level VARCHAR(20) DEFAULT 'medium',
  
  -- Media attachments
  image_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  attachments JSONB DEFAULT '[]',
  
  -- Question bank
  is_reusable BOOLEAN DEFAULT false, -- Can be used in multiple quizzes
  usage_count INTEGER DEFAULT 0,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_questions_sequence ON quiz_questions(quiz_id, sequence);
CREATE INDEX idx_quiz_questions_type ON quiz_questions(question_type);
CREATE INDEX idx_quiz_questions_reusable ON quiz_questions(is_reusable) WHERE is_reusable = true;

-- ============================================================================
-- 7. QUIZ ATTEMPTS
-- ============================================================================

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  
  -- Attempt details
  attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'expired')),
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  time_remaining_minutes INTEGER,
  
  -- Scoring
  score INTEGER DEFAULT NULL CHECK (score >= 0 AND score <= 100),
  points_earned INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  
  -- Answers and responses
  answers JSONB DEFAULT '{}', -- Question ID -> Answer mapping
  question_scores JSONB DEFAULT '{}', -- Question ID -> Score mapping
  
  -- Security and integrity
  ip_address INET,
  user_agent TEXT,
  suspicious_activity JSONB DEFAULT '[]',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Ensure unique attempt numbers per user per quiz
  UNIQUE(user_id, quiz_id, attempt_number)
);

-- Indexes
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_enrollment ON quiz_attempts(enrollment_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);
CREATE INDEX idx_quiz_attempts_completed ON quiz_attempts(completed_at) WHERE completed_at IS NOT NULL;

-- ============================================================================
-- 8. ASSIGNMENTS
-- ============================================================================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_content_id UUID NOT NULL REFERENCES learning_content(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Assignment details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  
  -- Submission settings
  submission_type VARCHAR(30) NOT NULL CHECK (submission_type IN ('file', 'text', 'url', 'multiple')),
  allowed_file_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  max_file_size_mb INTEGER DEFAULT 10,
  max_submissions INTEGER DEFAULT 1,
  
  -- Grading
  total_points INTEGER DEFAULT 100 CHECK (total_points > 0),
  grading_type VARCHAR(20) DEFAULT 'points' CHECK (grading_type IN ('points', 'percentage', 'pass_fail')),
  auto_grade BOOLEAN DEFAULT false,
  
  -- Timing
  due_date TIMESTAMP WITH TIME ZONE,
  late_submission_allowed BOOLEAN DEFAULT false,
  late_penalty_percentage INTEGER DEFAULT 0 CHECK (late_penalty_percentage >= 0 AND late_penalty_percentage <= 100),
  
  -- Availability
  available_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  available_until TIMESTAMP WITH TIME ZONE,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_assignments_content ON assignments(learning_content_id);
CREATE INDEX idx_assignments_org ON assignments(organization_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

-- ============================================================================
-- 9. ASSIGNMENT SUBMISSIONS
-- ============================================================================

CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  
  -- Submission details
  submission_number INTEGER NOT NULL DEFAULT 1 CHECK (submission_number > 0),
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
  
  -- Content
  text_content TEXT,
  file_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  submission_url TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timing
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_late BOOLEAN DEFAULT false,
  
  -- Grading
  score INTEGER DEFAULT NULL CHECK (score >= 0),
  grade VARCHAR(10),
  feedback TEXT,
  graded_by UUID,
  graded_at TIMESTAMP WITH TIME ZONE,
  
  -- File handling
  original_filenames TEXT[] DEFAULT ARRAY[]::TEXT[],
  file_sizes_kb INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  
  -- Ensure unique submission numbers per user per assignment
  UNIQUE(user_id, assignment_id, submission_number)
);

-- Indexes
CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_user ON assignment_submissions(user_id);
CREATE INDEX idx_submissions_status ON assignment_submissions(status);
CREATE INDEX idx_submissions_grading ON assignment_submissions(graded_by, graded_at);

-- ============================================================================
-- 10. CERTIFICATES
-- ============================================================================

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES course_enrollments(id) ON DELETE CASCADE,
  
  -- Certificate details
  certificate_number VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Completion details
  completion_date TIMESTAMP WITH TIME ZONE NOT NULL,
  final_score INTEGER CHECK (final_score >= 0 AND final_score <= 100),
  
  -- Certificate file
  certificate_url TEXT NOT NULL,
  template_used VARCHAR(100),
  
  -- Validity
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by UUID,
  revocation_reason TEXT,
  
  -- Verification
  verification_code VARCHAR(50) NOT NULL UNIQUE,
  public_verification_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_certificates_user ON certificates(user_id);
CREATE INDEX idx_certificates_path ON certificates(learning_path_id);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_certificates_verification ON certificates(verification_code);
CREATE INDEX idx_certificates_expiry ON certificates(expiry_date) WHERE expiry_date IS NOT NULL;

-- ============================================================================
-- 11. LEARNING ANALYTICS
-- ============================================================================

CREATE TABLE learning_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  content_id UUID REFERENCES learning_content(id) ON DELETE CASCADE,
  
  -- Event tracking
  event_type VARCHAR(50) NOT NULL, -- 'start', 'progress', 'complete', 'pause', 'resume', etc.
  event_data JSONB DEFAULT '{}',
  
  -- Context
  session_id UUID,
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(20),
  platform VARCHAR(20),
  
  -- Timing
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  
  -- Location in content
  content_position JSONB DEFAULT '{}', -- Page, timestamp, etc.
  
  -- Performance metrics
  interaction_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  help_requests INTEGER DEFAULT 0
);

-- Indexes for analytics queries
CREATE INDEX idx_analytics_org ON learning_analytics(organization_id);
CREATE INDEX idx_analytics_user ON learning_analytics(user_id);
CREATE INDEX idx_analytics_event ON learning_analytics(event_type);
CREATE INDEX idx_analytics_timestamp ON learning_analytics(timestamp);
CREATE INDEX idx_analytics_session ON learning_analytics(session_id);

-- ============================================================================
-- 12. DISCUSSION FORUMS
-- ============================================================================

CREATE TABLE discussion_forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  content_id UUID REFERENCES learning_content(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Forum details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  forum_type VARCHAR(20) DEFAULT 'course' CHECK (forum_type IN ('course', 'content', 'general', 'q_and_a')),
  
  -- Settings
  is_moderated BOOLEAN DEFAULT true,
  allow_anonymous BOOLEAN DEFAULT false,
  auto_subscribe BOOLEAN DEFAULT true,
  
  -- Statistics
  topic_count INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'readonly', 'archived')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 13. FORUM TOPICS AND POSTS
-- ============================================================================

CREATE TABLE forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id UUID NOT NULL REFERENCES discussion_forums(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Topic details
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  topic_type VARCHAR(20) DEFAULT 'discussion' CHECK (topic_type IN ('discussion', 'question', 'announcement')),
  
  -- User info
  created_by UUID NOT NULL,
  
  -- Moderation
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  
  -- Statistics
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  last_reply_at TIMESTAMP WITH TIME ZONE,
  last_reply_by UUID,
  
  -- Tags and categorization
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES forum_topics(id) ON DELETE CASCADE,
  parent_post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Post content
  content TEXT NOT NULL,
  
  -- User info
  created_by UUID NOT NULL,
  
  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 14. UPDATE TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to all relevant tables
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_content_updated_at BEFORE UPDATE ON learning_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_questions_updated_at BEFORE UPDATE ON quiz_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discussion_forums_updated_at BEFORE UPDATE ON discussion_forums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_topics_updated_at BEFORE UPDATE ON forum_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 15. HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(p_user_id UUID, p_learning_path_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_content INTEGER;
    completed_content INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Get total mandatory content
    SELECT COUNT(*) INTO total_content
    FROM learning_content lc
    WHERE lc.learning_path_id = p_learning_path_id
    AND lc.is_mandatory = true
    AND lc.status = 'active';
    
    -- Get completed content
    SELECT COUNT(*) INTO completed_content
    FROM learning_content lc
    JOIN user_learning_progress ulp ON lc.id = ulp.content_id
    WHERE lc.learning_path_id = p_learning_path_id
    AND lc.is_mandatory = true
    AND lc.status = 'active'
    AND ulp.user_id = p_user_id
    AND ulp.is_completed = true;
    
    -- Calculate percentage
    IF total_content = 0 THEN
        progress_percentage := 100;
    ELSE
        progress_percentage := (completed_content * 100) / total_content;
    END IF;
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number(p_organization_id UUID, p_learning_path_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    cert_number VARCHAR;
    org_code VARCHAR;
    course_code VARCHAR;
    sequence_num INTEGER;
BEGIN
    -- Get organization code (first 3 chars of name, uppercase)
    SELECT UPPER(LEFT(REGEXP_REPLACE(name, '[^A-Za-z0-9]', '', 'g'), 3)) INTO org_code
    FROM organizations WHERE id = p_organization_id;
    
    -- Get course code (first 3 chars of title, uppercase)
    SELECT UPPER(LEFT(REGEXP_REPLACE(title, '[^A-Za-z0-9]', '', 'g'), 3)) INTO course_code
    FROM learning_paths WHERE id = p_learning_path_id;
    
    -- Get next sequence number for this course
    SELECT COALESCE(MAX(CAST(RIGHT(certificate_number, 4) AS INTEGER)), 0) + 1 INTO sequence_num
    FROM certificates 
    WHERE organization_id = p_organization_id 
    AND learning_path_id = p_learning_path_id;
    
    -- Format: ORG-COU-YYYY-NNNN
    cert_number := org_code || '-' || course_code || '-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN cert_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Create default learning path categories
INSERT INTO learning_paths (id, organization_id, title, description, category, difficulty_level, is_published, created_by, updated_by)
SELECT 
    gen_random_uuid(),
    id,
    'Sample Security Awareness Course',
    'Introduction to cybersecurity best practices and threat awareness.',
    'security',
    'beginner',
    true,
    (SELECT id FROM organization_users WHERE organization_id = organizations.id LIMIT 1),
    (SELECT id FROM organization_users WHERE organization_id = organizations.id LIMIT 1)
FROM organizations
WHERE NOT EXISTS (SELECT 1 FROM learning_paths WHERE organization_id = organizations.id);

COMMENT ON TABLE learning_paths IS 'Core learning paths (courses) with multi-tenant isolation';
COMMENT ON TABLE learning_content IS 'Individual content items within learning paths';
COMMENT ON TABLE course_enrollments IS 'User enrollments in courses with progress tracking';
COMMENT ON TABLE user_learning_progress IS 'Detailed progress tracking for each content item';
COMMENT ON TABLE quizzes IS 'Quiz definitions with settings and metadata';
COMMENT ON TABLE quiz_questions IS 'Individual quiz questions with flexible answer formats';
COMMENT ON TABLE quiz_attempts IS 'User quiz attempts with security tracking';
COMMENT ON TABLE assignments IS 'Assignment definitions with submission requirements';
COMMENT ON TABLE assignment_submissions IS 'Student assignment submissions and grading';
COMMENT ON TABLE certificates IS 'Course completion certificates with verification';
COMMENT ON TABLE learning_analytics IS 'Detailed learning analytics and event tracking';
COMMENT ON TABLE discussion_forums IS 'Course and content discussion forums';
COMMENT ON TABLE forum_topics IS 'Discussion topics within forums';
COMMENT ON TABLE forum_posts IS 'Individual posts within forum topics';