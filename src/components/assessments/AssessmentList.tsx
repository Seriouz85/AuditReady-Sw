import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Clock,
  User,
  CheckCircle,
  MoreVertical,
  ChevronRight,
  RotateCcw,
  Pin,
  Calendar
} from "lucide-react";
import { Assessment, Standard } from '@/types';
import { cn } from "@/lib/utils";

interface ExtendedAssessment extends Assessment {
  standardNames?: string[];
  isPinned?: boolean;
}

interface AssessmentListProps {
  assessments: ExtendedAssessment[];
  standards: Standard[];
  loading: boolean;
  onSelectAssessment: (assessment: ExtendedAssessment) => void;
  onEditAssessment: (assessment: ExtendedAssessment) => void;
  onDeleteAssessment: (assessment: ExtendedAssessment) => void;
  onTogglePin: (assessment: ExtendedAssessment) => void;
  onNewAssessment: () => void;
}

export const AssessmentList: React.FC<AssessmentListProps> = ({
  assessments,
  standards,
  loading,
  onSelectAssessment,
  onEditAssessment,
  onDeleteAssessment,
  onTogglePin,
  onNewAssessment
}) => {
  // Sort assessments: pinned first, then by creation date (newest first)
  const sortedAssessments = [...assessments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt || '').getTime() - new Date(a.updatedAt || '').getTime();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-3 w-3" />;
      case 'in-progress': return <RotateCcw className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStandardName = (id: string): string => {
    const standard = standards.find(s => s.id === id);
    return standard?.name || id;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <h3 className="text-lg font-medium mb-2">No assessments found</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first compliance assessment
          </p>
          <Button onClick={onNewAssessment}>
            <Plus className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sortedAssessments.map((assessment) => (
        <Card 
          key={assessment.id} 
          className={cn(
            "group hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 relative overflow-hidden",
            assessment.isPinned && "ring-4 ring-primary/30 ring-offset-2 bg-gradient-to-br from-primary/8 to-primary/15 shadow-lg shadow-primary/20 border-primary/20"
          )}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/2 to-transparent group-hover:via-primary/5 transition-all duration-300" />
          
          {/* Enhanced Pinned indicator */}
          {assessment.isPinned && (
            <>
              <div className="absolute top-0 right-0 w-0 h-0 border-l-[35px] border-l-transparent border-t-[35px] border-t-primary/40">
                <Pin className="absolute -top-8 -right-1.5 h-4 w-4 text-primary transform rotate-45 drop-shadow-sm" />
              </div>
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-primary/10 backdrop-blur-sm px-2 py-1 rounded-full border border-primary/20">
                <Pin className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">Pinned</span>
              </div>
            </>
          )}
          
          <CardContent className="p-2 relative">
            <div className="flex items-center justify-between">
              <div 
                className="flex-1 flex items-center gap-2 cursor-pointer"
                onClick={() => onSelectAssessment(assessment)}
              >
                {/* Enhanced Status Icon and Progress */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={cn(
                      "p-2 rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-xl",
                      assessment.status === 'completed' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
                      assessment.status === 'in-progress' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                      'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                    )}>
                      {getStatusIcon(assessment.status)}
                    </div>
                    {assessment.isRecurring && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <RotateCcw className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {assessment.progress}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        completion
                      </div>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          assessment.progress === 100 ? 
                          "bg-gradient-to-r from-green-500 to-green-600" :
                          assessment.progress > 0 ?
                          "bg-gradient-to-r from-blue-500 to-blue-600" :
                          "bg-gradient-to-r from-gray-400 to-gray-500"
                        )}
                        style={{ width: `${assessment.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Assessment Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                      {assessment.name}
                    </h3>
                    {assessment.isRecurring && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <User className="h-2.5 w-2.5" />
                      </div>
                      {assessment.assessorNames && assessment.assessorNames.length > 1
                        ? `${assessment.assessorNames[0]} +${assessment.assessorNames.length - 1} more`
                        : assessment.assessorName}
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Calendar className="h-2.5 w-2.5" />
                      </div>
                      {new Date(assessment.startDate).toLocaleDateString()}
                    </span>
                    {assessment.nextDueDate && (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <Clock className="h-2.5 w-2.5 text-orange-600" />
                        </div>
                        Next: {new Date(assessment.nextDueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {assessment.standardIds.map(id => (
                      <Badge 
                        key={id} 
                        variant="outline" 
                        className="text-xs border-primary/20 text-primary/80 bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        {getStandardName(id)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Enhanced Status Badge */}
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    className={cn(
                      "text-sm font-medium px-4 py-2 rounded-lg shadow-md",
                      assessment.status === 'completed' ? 
                      'bg-gradient-to-r from-green-500 to-green-600 text-white border-0' :
                      assessment.status === 'in-progress' ?
                      'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' :
                      'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0'
                    )}
                  >
                    {assessment.status === 'completed' ? 'Completed' :
                     assessment.status === 'in-progress' ? 'In Progress' :
                     'Draft'}
                  </Badge>
                  
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(assessment.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Enhanced Actions */}
              <div className="flex items-center gap-2 ml-6">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAssessment(assessment);
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onTogglePin(assessment)}>
                      {assessment.isPinned ? 'Unpin' : 'Pin'} Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditAssessment(assessment)}>
                      Edit Assessment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDeleteAssessment(assessment)}>
                      Delete Assessment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};