import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InlineContentEditor } from './InlineContentEditor';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Video,
  Link as LinkIcon,
  FileQuestion,
  PenTool,
  GripVertical,
  Eye,
  Copy,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentCardProps {
  id: string;
  title: string;
  type: 'text' | 'video' | 'quiz';
  content: string;
  duration?: string;
  isExpanded?: boolean;
  isDragging?: boolean;
  onToggleExpand?: () => void;
  onEdit?: () => void;
  onUpdate?: (updates: { title?: string; content?: string }) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onPreview?: () => void;
  className?: string;
}

const contentTypeConfig = {
  text: {
    icon: FileText,
    color: 'bg-blue-500',
    label: 'Text Content'
  },
  video: {
    icon: Video,
    color: 'bg-red-500',
    label: 'Video'
  },
  quiz: {
    icon: FileQuestion,
    color: 'bg-green-500',
    label: 'Quiz'
  }
};

export const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  type,
  content,
  duration,
  isExpanded = false,
  isDragging = false,
  onToggleExpand,
  onEdit,
  onUpdate,
  onDelete,
  onDuplicate,
  onPreview,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const typeConfig = contentTypeConfig[type];
  const TypeIcon = typeConfig.icon;

  const getContentPreview = () => {
    if (type === 'quiz') {
      try {
        const quizData = JSON.parse(content);
        return quizData.question?.substring(0, 100) + '...' || 'Click to add quiz question';
      } catch {
        return 'Click to add quiz content';
      }
    }
    if (type === 'video') {
      return content || 'Click to add video URL';
    }
    return content?.substring(0, 150) + (content?.length > 150 ? '...' : '') || 'Click to add content';
  };

  return (
    <Card 
      className={`
        relative group transition-all duration-200 hover:shadow-md
        ${isDragging ? 'shadow-lg rotate-1 scale-105' : ''}
        ${isHovered ? 'border-blue-300' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <CardHeader className="pb-3 pl-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${typeConfig.color} flex items-center justify-center`}>
              <TypeIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-gray-900">
                {title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {typeConfig.label}
                </Badge>
                {duration && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {duration}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Expand/Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onPreview && (
                  <DropdownMenuItem onClick={onPreview}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
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
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* Expandable Content */}
      {isExpanded && (
        <CardContent className="pt-0 pl-10 animate-in slide-in-from-top-2 duration-200">
          {isEditing ? (
            <InlineContentEditor
              type={type}
              content={content}
              title={title}
              isOpen={isEditing}
              onSave={(newContent, newTitle) => {
                onUpdate?.({ 
                  content: newContent, 
                  ...(newTitle && { title: newTitle }) 
                });
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border hover:bg-gray-100 transition-colors">
              {/* Content Display */}
              <div className="mb-3">
                {type === 'text' && (
                  <div 
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500 italic">Click to add content</p>' }}
                  />
                )}
                
                {type === 'video' && (
                  <div className="space-y-2">
                    {content ? (
                      <div>
                        <div className="aspect-video bg-gray-200 rounded flex items-center justify-center mb-2">
                          <span className="text-gray-500">Video Preview</span>
                        </div>
                        <p className="text-sm text-gray-600">Video content configured</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Click to add video</p>
                      </div>
                    )}
                  </div>
                )}
                
                {type === 'quiz' && (
                  <div className="space-y-2">
                    {content ? (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileQuestion className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Quiz Ready</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            try {
                              const quizData = JSON.parse(content);
                              return `${quizData.questions?.length || 0} questions`;
                            } catch {
                              return 'Quiz configured';
                            }
                          })()}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileQuestion className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Click to add questions</p>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
              
              {/* Action buttons for expanded state */}
              <div className="flex gap-2 pt-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                >
                  <Edit className="mr-2 h-3 w-3" />
                  {content ? 'Edit' : 'Add'} Content
                </Button>
                {onPreview && content && (
                  <Button variant="outline" size="sm" onClick={onPreview}>
                    <Eye className="mr-2 h-3 w-3" />
                    Preview
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};