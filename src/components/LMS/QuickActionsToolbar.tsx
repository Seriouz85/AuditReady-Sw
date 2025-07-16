import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  Save, 
  Eye, 
  Undo, 
  Redo, 
  Copy, 
  Paste, 
  Settings, 
  Download, 
  Upload,
  Keyboard,
  Zap,
  Layers,
  BookOpen,
  Video,
  FileQuestion,
  PenTool,
  FileText,
  Link as LinkIcon,
  MoreHorizontal,
  Command,
  Shuffle,
  Library
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface QuickActionsToolbarProps {
  onAddSection: () => void;
  onAddModule: (type: string) => void;
  onSave: () => void;
  onPreview: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
  isSaving?: boolean;
  onOpenMediaBrowser?: () => void;
  className?: string;
}

const moduleTypes = [
  { type: 'text', label: 'Text Content', icon: FileText, shortcut: 'T' },
  { type: 'video', label: 'Video', icon: Video, shortcut: 'V' },
  { type: 'quiz', label: 'Quiz', icon: FileQuestion, shortcut: 'Q' }
];

const keyboardShortcuts = [
  { key: 'Ctrl+S', action: 'Save' },
  { key: 'Ctrl+Z', action: 'Undo' },
  { key: 'Ctrl+Y', action: 'Redo' },
  { key: 'Ctrl+/', action: 'Search' },
  { key: 'Ctrl+N', action: 'New Section' },
  { key: 'Ctrl+P', action: 'Preview' },
  { key: 'Esc', action: 'Cancel' }
];

export const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  onAddSection,
  onAddModule,
  onSave,
  onPreview,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  isSaving = false,
  onOpenMediaBrowser,
  className = ''
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            onSave();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              onRedo?.();
            } else {
              onUndo?.();
            }
            break;
          case 'y':
            e.preventDefault();
            onRedo?.();
            break;
          case 'n':
            e.preventDefault();
            onAddSection();
            break;
          case 'p':
            e.preventDefault();
            onPreview();
            break;
          case '/':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
        }
      }
      
      // Quick module creation shortcuts
      if (e.altKey) {
        const moduleType = moduleTypes.find(m => m.shortcut.toLowerCase() === e.key.toLowerCase());
        if (moduleType) {
          e.preventDefault();
          onAddModule(moduleType.type);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onSave, onUndo, onRedo, onAddSection, onPreview, onAddModule]);

  return (
    <TooltipProvider>
      <Card className={cn("border-0 shadow-md bg-white/95 backdrop-blur-sm", className)}>
        <div className="flex items-center justify-between p-3 gap-3">
          {/* Left Section - Core Actions */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAddSection}
                  className="gap-1 hover:bg-blue-50 hover:border-blue-200"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Section</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add new section (Ctrl+N)</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 hover:bg-green-50 hover:border-green-200"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Module</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add new module</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="w-48">
                {moduleTypes.map(({ type, label, icon: Icon, shortcut }) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => onAddModule(type)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{label}</span>
                    <Badge variant="secondary" className="text-xs">
                      Alt+{shortcut}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-gray-200" />

            {onOpenMediaBrowser && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenMediaBrowser}
                    className="gap-1 hover:bg-purple-50 hover:border-purple-200"
                  >
                    <Library className="h-4 w-4" />
                    <span className="hidden sm:inline">Media</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open media library</p>
                </TooltipContent>
              </Tooltip>
            )}

            <div className="w-px h-6 bg-gray-200" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUndo}
                  disabled={!canUndo}
                  className="hover:bg-gray-50"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRedo}
                  disabled={!canRedo}
                  className="hover:bg-gray-50"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Center Section - Search and Filter */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-input"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search modules... (Ctrl+/)"
                className="pl-10 pr-4 h-8 text-sm"
              />
            </div>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      <Filter className="h-4 w-4" />
                      {filterType !== 'all' && (
                        <Badge variant="secondary" className="text-xs">
                          {filterType}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by content type</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onFilterChange('all')}>
                  <Layers className="mr-2 h-4 w-4" />
                  All Types
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {moduleTypes.map(({ type, label, icon: Icon }) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => onFilterChange(type)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Section - Preview and Save */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreview}
                  className="gap-1 hover:bg-blue-50 hover:border-blue-200"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview course (Ctrl+P)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving}
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="hidden sm:inline">Save</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save course (Ctrl+S)</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-gray-50"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Course Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export Course
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Content
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Auto-organize
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Keyboard className="mr-2 h-4 w-4" />
                    Keyboard Shortcuts
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56">
                    {keyboardShortcuts.map((shortcut, index) => (
                      <DropdownMenuItem key={index} className="flex justify-between">
                        <span>{shortcut.action}</span>
                        <Badge variant="secondary" className="text-xs">
                          {shortcut.key}
                        </Badge>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
};