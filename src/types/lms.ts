export interface LearningPath {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  short_description?: string;
  category: 'security' | 'compliance' | 'technical' | 'soft-skills' | 'custom';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_minutes: number; // Updated to match DB schema
  total_modules: number;
  is_published: boolean;
  is_mandatory: boolean;
  is_featured?: boolean;
  thumbnail_url?: string;
  cover_image_url?: string;
  tags?: string[];
  prerequisites?: string[]; // IDs of prerequisite learning paths
  learning_objectives?: string[];
  target_audience?: string;
  language?: string;
  version?: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  metadata?: Record<string, any>;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  learning_content?: LearningContent[];
}

export interface LearningContent {
  id: string;
  learning_path_id: string;
  parent_id?: string; // For nested content structure
  title: string;
  description?: string;
  content_type: 'video' | 'document' | 'quiz' | 'simulation' | 'interactive' | 'text' | 'assignment' | 'scorm' | 'h5p';
  content?: Record<string, any>; // JSON content based on type
  sequence: number;
  duration_minutes?: number;
  is_mandatory: boolean;
  is_preview?: boolean; // Can be viewed without enrollment
  resource_url?: string; // For videos, documents, external resources
  resource_metadata?: Record<string, any>; // File size, format, etc.
  completion_criteria?: Record<string, any>; // How completion is determined
  passing_score?: number;
  max_attempts?: number;
  time_limit_minutes?: number;
  status: 'active' | 'inactive' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UserLearningProgress {
  id: string;
  user_id: string;
  organization_id: string;
  learning_path_id?: string;
  content_id?: string;
  enrollment_id: string;
  
  // Progress tracking
  progress_percentage: number;
  time_spent_minutes: number;
  session_count: number;
  
  // Completion tracking
  is_completed: boolean;
  completed_at?: string;
  first_accessed_at: string;
  last_accessed_at: string;
  
  // Attempt tracking
  attempt_count: number;
  best_score?: number;
  latest_score?: number;
  
  // Additional data
  bookmarks?: any[];
  notes?: string;
  metadata?: Record<string, any>;
  
  // Relations
  learning_paths?: LearningPath;
  learning_content?: LearningContent;
}

export interface TrainingAssignment {
  id: string;
  learning_path_id: string;
  assigned_to: string; // user_id
  assigned_by: string; // user_id
  organization_id: string;
  due_date: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  completed_at?: string;
  created_at: string;
  learning_paths?: LearningPath;
}

export interface CourseModule {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'link';
  content: any;
  duration?: number;
  sequence: number;
}

// Course Enrollment Interface
export interface CourseEnrollment {
  id: string;
  user_id: string;
  learning_path_id: string;
  organization_id: string;
  enrollment_type: 'self' | 'assigned' | 'mandatory' | 'bulk';
  enrolled_by?: string;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped' | 'expired';
  progress_percentage: number;
  total_time_spent_minutes: number;
  last_accessed_at: string;
  completion_score?: number;
  certificate_issued: boolean;
  certificate_url?: string;
  certificate_issued_at?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Quiz {
  id: string;
  learning_content_id: string;
  organization_id: string;
  title: string;
  description?: string;
  instructions?: string;
  
  // Quiz settings
  passing_score: number;
  max_attempts?: number;
  time_limit_minutes?: number;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_correct_answers: boolean;
  show_explanations: boolean;
  allow_review: boolean;
  
  // Availability
  available_from: string;
  available_until?: string;
  
  // Metadata
  total_questions: number;
  total_points: number;
  difficulty_level: string;
  estimated_duration_minutes: number;
  
  status: 'active' | 'inactive' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  organization_id: string;
  
  // Question content
  question_text: string;
  question_type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'long_answer' | 'fill_blank' | 'matching' | 'ordering' | 'numerical';
  
  // Answer options
  options?: any[];
  correct_answers: any;
  explanation?: string;
  
  // Scoring
  points: number;
  negative_marking: boolean;
  partial_credit: boolean;
  
  // Organization
  sequence: number;
  category?: string;
  tags?: string[];
  difficulty_level: string;
  
  // Media
  image_url?: string;
  video_url?: string;
  audio_url?: string;
  attachments?: any[];
  
  // Question bank
  is_reusable: boolean;
  usage_count: number;
  
  status: 'active' | 'inactive' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  organization_id: string;
  enrollment_id: string;
  
  // Attempt details
  attempt_number: number;
  status: 'in_progress' | 'completed' | 'abandoned' | 'expired';
  
  // Timing
  started_at: string;
  completed_at?: string;
  time_spent_minutes: number;
  time_remaining_minutes?: number;
  
  // Scoring
  score?: number;
  points_earned: number;
  total_points: number;
  
  // Responses
  answers: Record<string, any>;
  question_scores: Record<string, any>;
  
  // Security
  ip_address?: string;
  user_agent?: string;
  suspicious_activity?: any[];
  
  metadata?: Record<string, any>;
}

// Legacy interface for backwards compatibility
export interface UserQuizAttempt extends QuizAttempt {
  passed: boolean;
  time_taken_minutes: number;
}

export interface LearningAnalytics {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalTimeSpent: number;
  averageScore: number;
  certificatesEarned: number;
  upcomingDeadlines: number;
  overdueCourses: number;
}

export interface CourseStats {
  courseId: string;
  totalEnrolled: number;
  completedCount: number;
  completionRate: number;
  averageProgress: number;
  averageScore: number;
  averageTimeSpent: number;
}

// Assignment Interfaces
export interface Assignment {
  id: string;
  learning_content_id: string;
  organization_id: string;
  
  // Assignment details
  title: string;
  description: string;
  instructions?: string;
  
  // Submission settings
  submission_type: 'file' | 'text' | 'url' | 'multiple';
  allowed_file_types?: string[];
  max_file_size_mb: number;
  max_submissions: number;
  
  // Grading
  total_points: number;
  grading_type: 'points' | 'percentage' | 'pass_fail';
  auto_grade: boolean;
  
  // Timing
  due_date?: string;
  late_submission_allowed: boolean;
  late_penalty_percentage: number;
  
  // Availability
  available_from: string;
  available_until?: string;
  
  status: 'active' | 'inactive' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  organization_id: string;
  enrollment_id: string;
  
  // Submission details
  submission_number: number;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  
  // Content
  text_content?: string;
  file_urls?: string[];
  submission_url?: string;
  metadata?: Record<string, any>;
  
  // Timing
  submitted_at: string;
  is_late: boolean;
  
  // Grading
  score?: number;
  grade?: string;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  
  // File handling
  original_filenames?: string[];
  file_sizes_kb?: number[];
}

// Certificate Interface
export interface Certificate {
  id: string;
  user_id: string;
  organization_id: string;
  learning_path_id: string;
  enrollment_id: string;
  
  // Certificate details
  certificate_number: string;
  title: string;
  description?: string;
  
  // Completion details
  completion_date: string;
  final_score?: number;
  
  // Certificate file
  certificate_url: string;
  template_used?: string;
  
  // Validity
  issued_date: string;
  expiry_date?: string;
  is_revoked: boolean;
  revoked_at?: string;
  revoked_by?: string;
  revocation_reason?: string;
  
  // Verification
  verification_code: string;
  public_verification_url?: string;
  
  metadata?: Record<string, any>;
  created_at: string;
}

// Discussion Forum Interfaces
export interface DiscussionForum {
  id: string;
  learning_path_id?: string;
  content_id?: string;
  organization_id: string;
  
  // Forum details
  title: string;
  description?: string;
  forum_type: 'course' | 'content' | 'general' | 'q_and_a';
  
  // Settings
  is_moderated: boolean;
  allow_anonymous: boolean;
  auto_subscribe: boolean;
  
  // Statistics
  topic_count: number;
  post_count: number;
  last_activity_at?: string;
  
  status: 'active' | 'readonly' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ForumTopic {
  id: string;
  forum_id: string;
  organization_id: string;
  
  // Topic details
  title: string;
  content: string;
  topic_type: 'discussion' | 'question' | 'announcement';
  
  // User info
  created_by: string;
  
  // Moderation
  is_pinned: boolean;
  is_locked: boolean;
  is_approved: boolean;
  
  // Statistics
  view_count: number;
  reply_count: number;
  last_reply_at?: string;
  last_reply_by?: string;
  
  // Tags
  tags?: string[];
  
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  parent_post_id?: string;
  organization_id: string;
  
  // Post content
  content: string;
  
  // User info
  created_by: string;
  
  // Moderation
  is_approved: boolean;
  is_flagged: boolean;
  flag_reason?: string;
  
  // Engagement
  like_count: number;
  
  created_at: string;
  updated_at: string;
}

export interface MediaLibraryItem {
  id: string;
  name: string;
  type: 'video' | 'image' | 'document' | 'audio';
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  tags?: string[];
  description?: string;
}