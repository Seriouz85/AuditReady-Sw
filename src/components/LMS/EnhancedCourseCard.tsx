import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  BookOpen, 
  Users, 
  Star, 
  Play, 
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Share,
  Award,
  TrendingUp,
  UserPlus,
  Loader2,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LearningPath, CourseEnrollment } from '@/types/lms';
import { enrollmentService } from '@/services/lms/EnrollmentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';

interface EnhancedCourseCardProps {
  course: LearningPath;
  enrollment?: CourseEnrollment | null;
  enrolledStudents?: number;
  rating?: number;
  instructor?: {
    name: string;
    avatar?: string;
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  onEnrollmentUpdate?: () => void;
  className?: string;
  showActions?: boolean;
}

const difficultyConfig = {
  beginner: { color: 'bg-green-100 text-green-800', label: 'Beginner' },
  intermediate: { color: 'bg-yellow-100 text-yellow-800', label: 'Intermediate' },
  advanced: { color: 'bg-red-100 text-red-800', label: 'Advanced' }
};

const categoryColors = {
  security: 'bg-purple-100 text-purple-800',
  compliance: 'bg-blue-100 text-blue-800',
  technical: 'bg-orange-100 text-orange-800',
  'soft-skills': 'bg-teal-100 text-teal-800',
  custom: 'bg-gray-100 text-gray-800'
};

export const EnhancedCourseCard: React.FC<EnhancedCourseCardProps> = ({
  course,
  enrollment,
  enrolledStudents,
  rating,
  instructor,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  onEnrollmentUpdate,
  className = '',
  showActions = true
}) => {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [localEnrollment, setLocalEnrollment] = useState<CourseEnrollment | null>(enrollment || null);

  const difficultyStyle = difficultyConfig[course.difficulty_level];
  const categoryColor = categoryColors[course.category] || categoryColors.custom;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}m` : ''}`;
  };

  const handleEnroll = async () => {
    if (!user || !organization) {
      toast.error('Please sign in to enroll');
      return;
    }

    setIsEnrolling(true);
    try {
      const success = await enrollmentService.enrollUser(
        user.id,
        course.id,
        organization.id,
        'self'
      );

      if (success) {
        // Refetch enrollment data
        const enrollments = await enrollmentService.getUserEnrollments(user.id, organization.id);
        const newEnrollment = enrollments.find(e => e.learning_path_id === course.id);
        setLocalEnrollment(newEnrollment || null);
        onEnrollmentUpdate?.();
      }
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCourseAccess = () => {
    if (localEnrollment) {
      // User is enrolled, go to course viewer
      navigate(`/lms/courses/${course.id}/view`);
    } else {
      // User not enrolled, show course details/preview
      navigate(`/lms/courses/${course.id}/preview`);
    }
  };

  const getEnrollmentStatus = () => {
    if (!localEnrollment) return null;
    
    switch (localEnrollment.status) {
      case 'completed':
        return { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'in_progress':
        return { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Play };
      case 'enrolled':
        return { label: 'Enrolled', color: 'bg-gray-100 text-gray-800', icon: BookOpen };
      default:
        return null;
    }
  };

  const statusInfo = getEnrollmentStatus();

  return (
    <Card className={`group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${className}`}>
      {/* Course Image */}
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
          {course.thumbnail_url || course.cover_image_url ? (
            <img 
              src={course.thumbnail_url || course.cover_image_url} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          {/* Status badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {course.is_mandatory && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                Required
              </Badge>
            )}
            {course.is_featured && (
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {statusInfo && (
              <Badge className={`${statusInfo.color} text-xs`}>
                <statusInfo.icon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
            )}
          </div>

          {/* Actions menu */}
          {showActions && (
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCourseAccess}>
                    <Eye className="mr-2 h-4 w-4" />
                    {localEnrollment ? 'View Course' : 'Preview'}
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDuplicate && (
                    <DropdownMenuItem onClick={onDuplicate}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                  )}
                  {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={onDelete} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Progress indicator */}
          {localEnrollment && localEnrollment.progress_percentage > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${localEnrollment.progress_percentage}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <CardHeader className="pb-1 pt-3 px-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight text-gray-900 line-clamp-2 flex-1">
              {course.title}
            </h3>
            {rating && (
              <div className="flex items-center gap-1 text-sm text-amber-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {course.short_description || course.description}
          </p>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {course.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{course.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4 pb-4 flex-1 flex flex-col">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={difficultyStyle.color}>
            {difficultyStyle.label}
          </Badge>
          <Badge className={categoryColor}>
            {course.category.replace('-', ' ')}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(course.estimated_duration_minutes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.total_modules} module{course.total_modules !== 1 ? 's' : ''}</span>
          </div>
          {enrolledStudents !== undefined && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{enrolledStudents}</span>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Progress section */}
        {localEnrollment && localEnrollment.progress_percentage > 0 && (
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{localEnrollment.progress_percentage}%</span>
            </div>
            <Progress value={localEnrollment.progress_percentage} className="h-2" />
          </div>
        )}

        {/* Instructor section */}
        {instructor && (
          <div className="flex items-center gap-2 text-sm mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={instructor.avatar} />
              <AvatarFallback className="text-xs">
                {instructor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-gray-600">by {instructor.name}</span>
          </div>
        )}

        {/* Action button */}
        <div>
          {localEnrollment ? (
            // User is enrolled
            <Button 
              onClick={handleCourseAccess}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium py-2.5 rounded-xl"
            >
              {localEnrollment.progress_percentage > 0 ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Continue Learning
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Course
                </>
              )}
            </Button>
          ) : (
            // User not enrolled
            <Button 
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium py-2.5 rounded-xl"
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Enroll Now
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};