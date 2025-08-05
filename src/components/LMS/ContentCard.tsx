import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Clock,
  Edit2
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
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  // Start in edit mode if there's no content
  const [isEditing, setIsEditing] = useState(!content && isExpanded);
  const typeConfig = contentTypeConfig[type];
  const TypeIcon = typeConfig.icon;
  
  // Automatically start editing when expanded without content
  React.useEffect(() => {
    if (isExpanded && !content && !isEditing) {
      setIsEditing(true);
    }
  }, [isExpanded, content, isEditing]);

  // Update title value when title prop changes
  React.useEffect(() => {
    setTitleValue(title);
  }, [title]);

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue !== title) {
      onUpdate?.({ title: titleValue.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
    if (e.key === 'Escape') {
      setTitleValue(title);
      setIsEditingTitle(false);
    }
  };

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
      data-module-id={id}
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
              <div className="flex items-center gap-2">
                {isEditingTitle ? (
                  <Input
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyPress}
                    className="text-sm font-medium h-6 border-none shadow-none px-0 focus:ring-0"
                    autoFocus
                  />
                ) : (
                  <>
                    <CardTitle 
                      className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-blue-50"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      <Edit2 className="h-3 w-3 text-gray-400 hover:text-blue-600" />
                    </Button>
                  </>
                )}
              </div>
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
                  <DropdownMenuItem onClick={() => setIsEditing(true)} data-action="edit">
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
        <CardContent className="pt-0 pl-10 pr-4 animate-in slide-in-from-top-2 duration-200">
          {isEditing ? (
            <div className="-mx-6 px-6">
              <InlineContentEditor
                type={type}
                content={content}
                title={title}
                isOpen={isEditing}
                onSave={(newContent) => {
                  onUpdate?.({ content: newContent });
                  setIsEditing(false);
                }}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div 
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer rounded-lg"
              onClick={() => setIsEditing(true)}
              data-action="edit"
            >
              {/* Content Display */}
              <div className="mb-3">
                {type === 'text' && (
                  <div 
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500 italic">No content yet</p>' }}
                  />
                )}
                
                {type === 'video' && (
                  <div className="space-y-2">
                    {content ? (
                      <div>
                        {(() => {
                          try {
                            const videoData = JSON.parse(content);
                            const videoUrl = videoData.url;
                            if (videoUrl) {
                              // Check if it's a YouTube URL
                              const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                              if (youtubeMatch) {
                                const videoId = youtubeMatch[1];
                                return (
                                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-2">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${videoId}`}
                                      className="w-full h-full"
                                      allowFullScreen
                                      title={videoData.title || 'Video'}
                                    />
                                  </div>
                                );
                              }
                              // Check if it's a Vimeo URL
                              const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
                              if (vimeoMatch) {
                                const videoId = vimeoMatch[1];
                                return (
                                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-2">
                                    <iframe
                                      src={`https://player.vimeo.com/video/${videoId}`}
                                      className="w-full h-full"
                                      allowFullScreen
                                      title={videoData.title || 'Video'}
                                    />
                                  </div>
                                );
                              }
                              // Check if it's a direct video file
                              if (videoUrl.includes('.mp4') || videoUrl.includes('.webm') || videoUrl.includes('.ogg')) {
                                return (
                                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-2">
                                    <video
                                      src={videoUrl}
                                      controls
                                      className="w-full h-full"
                                      title={videoData.title || 'Video'}
                                    />
                                  </div>
                                );
                              }
                            }
                            // Fallback for invalid URL
                            return (
                              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                                <div className="text-center">
                                  <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                  <span className="text-sm text-gray-500">Invalid video URL</span>
                                </div>
                              </div>
                            );
                          } catch {
                            return (
                              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                                <span className="text-gray-500">Video Preview</span>
                              </div>
                            );
                          }
                        })()}
                        <p className="text-sm text-gray-600">
                          {(() => {
                            try {
                              const videoData = JSON.parse(content);
                              return videoData.title || 'Video content configured';
                            } catch {
                              return 'Video content configured';
                            }
                          })()}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Video className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">No video added</p>
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
                        <p className="text-sm text-gray-500">No questions added</p>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
              
              {/* Preview button only - content is directly editable by clicking */}
              {onPreview && content && (
                <div className="flex justify-end pt-3">
                  <Button variant="outline" size="sm" onClick={onPreview}>
                    <Eye className="mr-2 h-3 w-3" />
                    Preview
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};