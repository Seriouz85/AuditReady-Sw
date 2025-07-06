import React from 'react';
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
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  totalModules: number;
  enrolledStudents?: number;
  rating?: number;
  progress?: number; // 0-100
  thumbnailUrl?: string;
  isPublished?: boolean;
  isMandatory?: boolean;
  instructor?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onShare?: () => void;
  className?: string;
}

const difficultyConfig = {
  beginner: { color: 'bg-green-100 text-green-800', label: 'Beginner' },
  intermediate: { color: 'bg-yellow-100 text-yellow-800', label: 'Intermediate' },
  advanced: { color: 'bg-red-100 text-red-800', label: 'Advanced' }
};

const categoryColors = {
  compliance: 'bg-blue-100 text-blue-800',
  'security-awareness': 'bg-purple-100 text-purple-800',
  technical: 'bg-orange-100 text-orange-800',
  'data-protection': 'bg-teal-100 text-teal-800',
  governance: 'bg-indigo-100 text-indigo-800',
  risk: 'bg-red-100 text-red-800'
};

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  description,
  category,
  difficulty,
  duration,
  totalModules,
  enrolledStudents,
  rating,
  progress,
  thumbnailUrl,
  isPublished = false,
  isMandatory = false,
  instructor,
  tags = [],
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onShare,
  className = ''
}) => {
  const navigate = useNavigate();
  const difficultyStyle = difficultyConfig[difficulty];
  const categoryColor = categoryColors[category as keyof typeof categoryColors] || 'bg-gray-100 text-gray-800';

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <Card className={`group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full ${className}`}>
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-white opacity-80" />
          </div>
        )}
        
        {/* Overlay with badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isMandatory && (
            <Badge className="bg-red-500 hover:bg-red-600">
              Required
            </Badge>
          )}
          {!isPublished && (
            <Badge variant="secondary">
              Draft
            </Badge>
          )}
        </div>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/lms/viewer/${id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Course
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
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Progress indicator if applicable */}
        {typeof progress === 'number' && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <CardHeader className="pb-2 pt-4 px-4">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight text-gray-900 line-clamp-2">
              {title}
            </h3>
            {rating && (
              <div className="flex items-center gap-1 text-sm text-amber-600">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4 pb-4 flex flex-col flex-1">
        {/* Course metadata */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <Badge className={difficultyStyle.color}>
                {difficultyStyle.label}
              </Badge>
              <Badge className={categoryColor}>
                {category.replace('-', ' ')}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{totalModules} module{totalModules !== 1 ? 's' : ''}</span>
            </div>
            {enrolledStudents !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{enrolledStudents}</span>
              </div>
            )}
          </div>

          {/* Progress section */}
          {typeof progress === 'number' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Instructor */}
          {instructor && (
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-6 w-6">
                <AvatarImage src={instructor.avatar} />
                <AvatarFallback className="text-xs">
                  {instructor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-600">by {instructor.name}</span>
            </div>
          )}
        </div>

        {/* Action button - Always at bottom */}
        <div className="mt-3">
          {typeof progress === 'number' && progress > 0 ? (
            <Button 
              onClick={() => navigate(`/lms/viewer/${id}`)}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium py-2.5 rounded-xl border-0"
              variant="default"
            >
              <Play className="mr-2 h-4 w-4" />
              Continue Learning
            </Button>
          ) : (
            <Button 
              onClick={() => navigate(`/lms/viewer/${id}`)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium py-2.5 rounded-xl"
              variant="default"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Course
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};