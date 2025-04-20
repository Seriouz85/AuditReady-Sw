import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Assessment, Standard } from "@/types";
import { BarChart, Calendar, CheckCircle2, Clock, User } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { standards } from "@/data/mockData";
import { useTranslation } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";

interface AssessmentCardProps {
  assessment: Assessment;
  onContinue: (assessment: Assessment) => void;
}

export function AssessmentCard({ assessment, onContinue }: AssessmentCardProps) {
  const { t } = useTranslation();
  
  // Get standards information
  const selectedStandards = standards.filter(s => assessment.standardIds.includes(s.id));
  
  // Format the status text based on assessment status
  const getStatusText = () => {
    switch(assessment.status) {
      case 'completed': return t('assessment.status.text.completed');
      case 'in-progress': return t('assessment.status.text.inProgress');
      default: return t('assessment.status.text.draft');
    }
  };
  
  // Get color for the progress bar based on status
  const getProgressColor = () => {
    return assessment.status === 'completed' 
      ? "bg-green-600" 
      : "bg-blue-600";
  };
  
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">{assessment.name}</CardTitle>
            <CardDescription>
              {selectedStandards.length === 1 
                ? `${selectedStandards[0]?.name} ${selectedStandards[0]?.version}` 
                : `${selectedStandards.length} Standards`}
            </CardDescription>
            
            {selectedStandards.length > 1 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedStandards.map(s => (
                  <Badge key={s.id} variant="outline" className="text-xs">
                    {s.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className={`text-xs px-3 py-1 rounded-full ${
            assessment.status === 'completed' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : assessment.status === 'in-progress'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400'
          }`}>
            {getStatusText()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 pt-2 space-y-4">
        <div className="text-sm text-muted-foreground line-clamp-2">
          {assessment.description}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm items-center">
            <span>{t('assessment.progress')}</span>
            <span className="font-medium">{assessment.progress}%</span>
          </div>
          <Progress 
            value={assessment.progress} 
            className="h-2"
          >
            <div 
              className={`h-full ${getProgressColor()}`}
              style={{ width: `${assessment.progress}%` }}
            ></div>
          </Progress>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(assessment.startDate)}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <User size={14} />
            <span className="truncate" title={assessment.assessorName}>
              {assessment.assessorName}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-3 bg-muted/10">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full flex gap-2"
          onClick={() => onContinue(assessment)}
        >
          {assessment.status === 'completed' 
            ? <CheckCircle2 size={16} /> 
            : <BarChart size={16} />}
          {t('assessment.continue')}
        </Button>
      </CardFooter>
    </Card>
  );
} 