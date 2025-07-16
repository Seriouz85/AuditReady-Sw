import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ContentCard } from './ContentCard';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  GripVertical,
  ArrowUp,
  ArrowDown,
  FileText,
  Video,
  Link as LinkIcon,
  FileQuestion,
  PenTool,
  Clock,
  BookOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Module {
  id: string;
  title: string;
  type: 'text' | 'video' | 'quiz';
  content: string;
  duration?: string;
  isExpanded?: boolean;
}

interface SectionCardProps {
  id: string;
  title: string;
  modules: Module[];
  isExpanded: boolean;
  isDragging?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onToggleExpand: () => void;
  onUpdateTitle: (newTitle: string) => void;
  onAddModule: (type: Module['type']) => void;
  onUpdateModule: (moduleId: string, updates: Partial<Module>) => void;
  onDeleteModule: (moduleId: string) => void;
  onDuplicateModule: (moduleId: string) => void;
  onMoveSection: (direction: 'up' | 'down') => void;
  onDeleteSection: () => void;
  className?: string;
}

const moduleTypeOptions = [
  { type: 'text' as const, icon: FileText, label: 'Text Content', color: 'bg-blue-500' },
  { type: 'video' as const, icon: Video, label: 'Video', color: 'bg-red-500' },
  { type: 'quiz' as const, icon: FileQuestion, label: 'Quiz', color: 'bg-green-500' }
];

export const SectionCard: React.FC<SectionCardProps> = ({
  id,
  title,
  modules,
  isExpanded,
  isDragging = false,
  isFirst = false,
  isLast = false,
  onToggleExpand,
  onUpdateTitle,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onDuplicateModule,
  onMoveSection,
  onDeleteSection,
  className = ''
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(title);
  const [isHovered, setIsHovered] = useState(false);

  const handleTitleSave = () => {
    onUpdateTitle(titleValue);
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

  const getTotalDuration = () => {
    const total = modules.reduce((acc, module) => {
      if (module.duration) {
        const duration = parseInt(module.duration);
        return acc + (isNaN(duration) ? 0 : duration);
      }
      return acc;
    }, 0);
    return total > 0 ? `${total} min` : null;
  };

  return (
    <Card 
      id={id}
      className={`
        relative group transition-all duration-200 
        ${isDragging ? 'shadow-lg rotate-1 scale-105' : 'hover:shadow-md'}
        ${isHovered ? 'border-blue-300' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Drag Handle */}
      <div className="absolute left-3 top-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      <CardHeader className="pb-4 pl-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1">
              {isEditingTitle ? (
                <Input
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyPress}
                  className="text-lg font-semibold"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h3 
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {modules.length} module{modules.length !== 1 ? 's' : ''}
                </Badge>
                {getTotalDuration() && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {getTotalDuration()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Section Actions */}
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
                {!isFirst && (
                  <DropdownMenuItem onClick={() => onMoveSection('up')}>
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Move Up
                  </DropdownMenuItem>
                )}
                {!isLast && (
                  <DropdownMenuItem onClick={() => onMoveSection('down')}>
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Move Down
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDeleteSection} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
          </div>
        </div>
      </CardHeader>

      {/* Expandable Content */}
      {isExpanded && (
        <CardContent className="pt-0 pl-12 animate-in slide-in-from-top-2 duration-200">
          {/* Modules */}
          <div className="space-y-3">
            {modules.map((module) => (
              <ContentCard
                key={module.id}
                id={module.id}
                title={module.title}
                type={module.type}
                content={module.content}
                duration={module.duration}
                isExpanded={module.isExpanded}
                onToggleExpand={() => onUpdateModule(module.id, { isExpanded: !module.isExpanded })}
                onUpdate={(updates) => onUpdateModule(module.id, updates)}
                onDelete={() => onDeleteModule(module.id)}
                onDuplicate={() => onDuplicateModule(module.id)}
              />
            ))}

            {/* Direct Module Addition */}
            <div className="mt-4 space-y-2">
              {moduleTypeOptions.map(({ type, icon: Icon, label, color }) => (
                <div
                  key={type}
                  onClick={() => onAddModule(type)}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all duration-200 group"
                >
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">
                      {type === 'text' && 'Add formatted text, images, and links'}
                      {type === 'video' && 'Embed videos from YouTube, Vimeo, or upload'}
                      {type === 'quiz' && 'Create interactive assessments'}
                    </p>
                  </div>
                  <Plus className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};