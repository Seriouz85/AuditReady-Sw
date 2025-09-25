import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Clock, 
  RotateCcw, 
  CheckCircle, 
  MoreVertical, 
  ChevronRight, 
  User, 
  Calendar,
  Pin
} from "lucide-react";
import { Assessment, Standard } from "@/types";
import { useTranslation } from "@/lib/i18n";

interface ExtendedAssessment extends Assessment {
  standardNames?: string[];
}

interface AssessmentCardProps {
  assessment: ExtendedAssessment;
  standards: Standard[];
  onSelectAssessment: (assessment: ExtendedAssessment) => void;
  onEditAssessment: (assessment: ExtendedAssessment) => void;
  onDeleteAssessment: (assessment: ExtendedAssessment) => void;
  onTogglePin: (assessment: ExtendedAssessment) => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  standards,
  onSelectAssessment,
  onEditAssessment,
  onDeleteAssessment,
  onTogglePin
}) => {
  const { t } = useTranslation();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Clock className="h-3 w-3" />;
      case 'in-progress': return <RotateCcw className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'in-progress': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStandardNames = () => {
    return assessment.standardIds.map(id => {
      const standard = standards.find(s => s.id === id);
      return standard ? `${standard.name} ${standard.version}` : 'Unknown Standard';
    });
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 cursor-pointer relative ${
      assessment.isPinned ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
    }`}>
      {assessment.isPinned && (
        <div className="absolute top-2 right-2 z-10">
          <Pin className="h-4 w-4 text-blue-600 fill-blue-600" />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-start gap-2 mb-2">
              <h3 
                className="font-semibold text-base leading-tight truncate hover:text-primary transition-colors"
                onClick={() => onSelectAssessment(assessment)}
              >
                {assessment.name}
              </h3>
              {assessment.isRecurring && (
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {t('assessments.recurring')}
                </Badge>
              )}
            </div>
            
            {assessment.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {assessment.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-1 mb-2">
              {getStandardNames().map((standardName, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {standardName}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            <Badge
              variant={getStatusVariant(assessment.status)}
              className={`text-xs font-medium px-2 py-1 ${getStatusColor(assessment.status)}`}
            >
              <span className="flex items-center gap-1">
                {getStatusIcon(assessment.status)}
                {t(`assessments.status.${assessment.status}`)}
              </span>
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelectAssessment(assessment)}>
                  <ChevronRight className="mr-2 h-4 w-4" />
                  {t('assessments.view')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditAssessment(assessment)}>
                  <User className="mr-2 h-4 w-4" />
                  {t('assessments.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTogglePin(assessment)}>
                  <Pin className="mr-2 h-4 w-4" />
                  {assessment.isPinned ? t('assessments.unpin') : t('assessments.pin')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteAssessment(assessment)}
                  className="text-red-600 hover:text-red-700"
                >
                  <ChevronRight className="mr-2 h-4 w-4" />
                  {t('assessments.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[120px]">
                {Array.isArray(assessment.assessorNames) && assessment.assessorNames.length > 0
                  ? assessment.assessorNames.length > 1
                    ? `${assessment.assessorNames[0]} +${assessment.assessorNames.length - 1}`
                    : assessment.assessorNames[0]
                  : assessment.assessorName || 'Unassigned'
                }
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(assessment.startDate)}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`font-medium ${
              assessment.status === 'completed' ? 'text-green-600' : 
              assessment.status === 'in-progress' ? 'text-blue-600' : 
              'text-gray-600'
            }`}>
              {assessment.progress}%
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                assessment.status === 'completed' ? 'bg-green-500' : 
                assessment.status === 'in-progress' ? 'bg-blue-500' : 
                'bg-gray-400'
              }`}
              style={{ width: `${assessment.progress}%` }}
            />
          </div>
        </div>
        
        {/* Click area for opening assessment */}
        <div 
          className="absolute inset-0 z-0"
          onClick={() => onSelectAssessment(assessment)}
        />
      </CardContent>
    </Card>
  );
};