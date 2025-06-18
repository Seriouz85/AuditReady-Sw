/**
 * Modern Editor Header - Professional design for AuditReady Editor
 * Clean, modern header with professional light theme
 */

import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Share2, 
  Palette, 
  Sparkles,
  MoreHorizontal,
  ChevronDown,
  Grid3X3,
  Eye,
  Settings
} from 'lucide-react';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { AuditReadyThemes, ModernTypography, ModernSpacing } from '../ui/design-system/AuditReadyDesignSystem';

interface ModernEditorHeaderProps {
  projectName: string;
  onBack?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  onThemeChange?: (theme: string) => void;
  currentTheme: string;
  showBackButton?: boolean;
  canvasBackground?: string;
}

export const ModernEditorHeader: React.FC<ModernEditorHeaderProps> = ({
  projectName,
  onBack,
  onSave,
  onExport,
  onThemeChange,
  currentTheme,
  showBackButton = true,
  canvasBackground
}) => {
  const currentThemeData = AuditReadyThemes[currentTheme as keyof typeof AuditReadyThemes] || AuditReadyThemes['Executive Clean'];

  return (
    <header 
      className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm"
      style={{ 
        borderColor: currentThemeData.colors.border,
        fontFamily: ModernTypography.fontFamily.body
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Navigation & Title */}
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: currentThemeData.colors.accent,
                  color: 'white'
                }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  AuditReady Editor
                </h1>
                <p className="text-xs text-slate-500">
                  Professional Diagram Designer
                </p>
              </div>
            </div>
            
            {projectName && (
              <>
                <div className="w-px h-6 bg-slate-300" />
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-700">
                    {projectName || 'Untitled Diagram'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Draft
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center Section - Theme Indicator */}
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-slate-600">
                <Palette className="h-4 w-4 mr-2" />
                {currentThemeData.name}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64">
              <div className="p-2">
                <p className="text-sm font-medium text-slate-900 mb-3">
                  Professional Themes
                </p>
                <div className="space-y-2">
                  {Object.entries(AuditReadyThemes).map(([key, theme]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => onThemeChange?.(key)}
                      className="flex items-center space-x-3 p-3 rounded-md cursor-pointer"
                    >
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ 
                          background: theme.preview,
                          borderColor: currentThemeData.colors.border
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {theme.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {theme.description}
                        </p>
                      </div>
                      {currentTheme === key && (
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <div className="w-px h-6 bg-slate-300" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className="text-slate-700 border-slate-300"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm"
                style={{ 
                  backgroundColor: currentThemeData.colors.accent,
                  color: 'white',
                  border: 'none'
                }}
                className="hover:opacity-90"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Export
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export as SVG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Optional subtle progress bar or status indicator */}
      <div 
        className="h-0.5 w-full opacity-20"
        style={{ 
          background: `linear-gradient(90deg, ${currentThemeData.colors.accent} 0%, transparent 100%)`
        }}
      />
    </header>
  );
};