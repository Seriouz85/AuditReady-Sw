export interface LearningPath {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  category: 'security' | 'compliance' | 'technical' | 'soft-skills' | 'custom';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number; // in minutes
  total_modules: number;
  is_published: boolean;
  is_mandatory: boolean;
  thumbnail_url?: string;
  tags?: string[];
  prerequisites?: string[]; // IDs of prerequisite learning paths
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  learning_content?: LearningContent[];
}

export interface LearningContent {
  id: string;
  learning_path_id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'document' | 'quiz' | 'simulation' | 'interactive' | 'text';
  content: any; // JSON content based on type
  sequence: number;
  duration_minutes?: number;
  is_mandatory: boolean;
  resource_url?: string; // For videos, documents, etc.
  created_by: string;
  created_at: string;
}

export interface UserLearningProgress {
  id: string;
  user_id: string;
  learning_path_id: string;
  content_id?: string; // null for path-level progress
  progress_percentage: number;
  time_spent_minutes: number;
  last_accessed_at: string;
  completed_at?: string;
  certificate_issued?: boolean;
  certificate_url?: string;
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

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'text';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface UserQuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  answers: Record<string, any>;
  score: number;
  passed: boolean;
  time_taken_minutes: number;
  completed_at: string;
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