import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  Save, 
  X, 
  Clock, 
  FileText, 
  Shield,
  ExternalLink,
  History,
  Eye
} from 'lucide-react';
import { RequirementFulfillment, RequirementStatus, ConfidenceLevel } from '@/types/applications';
import { ConfidenceLevelIndicator, CompactConfidenceIndicator } from './ConfidenceLevelIndicator';
import { formatDistanceToNow } from 'date-fns';

interface RequirementAnsweringInterfaceProps {
  requirements: RequirementFulfillment[];
  onUpdateRequirement?: (requirementId: string, updates: Partial<RequirementFulfillment>) => void;
  onViewRequirementDetails?: (requirementId: string) => void;
  isReadOnly?: boolean;
  showAuditTrail?: boolean;
  className?: string;
}

const statusConfig = {
  fulfilled: {
    icon: CheckCircle2,
    label: 'Fulfilled',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeVariant: 'default' as const,
  },
  partially_fulfilled: {
    icon: AlertTriangle,
    label: 'Partially Fulfilled',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badgeVariant: 'secondary' as const,
  },
  not_fulfilled: {
    icon: XCircle,
    label: 'Not Fulfilled',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeVariant: 'destructive' as const,
  },
  not_applicable: {
    icon: XCircle,
    label: 'Not Applicable',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeVariant: 'outline' as const,
  },
};

interface RequirementEditState {
  requirementId: string;
  status: RequirementStatus;
  evidence: string;
  justification: string;
  overrideReason: string;
}

export const RequirementAnsweringInterface: React.FC<RequirementAnsweringInterfaceProps> = ({
  requirements,
  onUpdateRequirement,
  onViewRequirementDetails,
  isReadOnly = false,
  showAuditTrail = true,
  className = '',
}) => {
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);
  const [editState, setEditState] = useState<RequirementEditState | null>(null);

  const autoAnsweredRequirements = requirements.filter(req => req.isAutoAnswered && !req.isManualOverride);
  const manualOverriddenRequirements = requirements.filter(req => req.isManualOverride);
  const manualRequirements = requirements.filter(req => !req.isAutoAnswered);

  const handleStartEdit = (requirement: RequirementFulfillment) => {
    setEditingRequirement(requirement.id);
    setEditState({
      requirementId: requirement.id,
      status: requirement.status,
      evidence: requirement.evidence,
      justification: requirement.justification,
      overrideReason: requirement.overrideReason || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingRequirement(null);
    setEditState(null);
  };

  const handleSaveEdit = () => {
    if (!editState || !onUpdateRequirement) return;

    const updates: Partial<RequirementFulfillment> = {
      status: editState.status,
      evidence: editState.evidence,
      justification: editState.justification,
      isManualOverride: true,
      overrideReason: editState.overrideReason,
      lastModifiedBy: 'Current User', // In real app, get from auth context
      lastModifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onUpdateRequirement(editState.requirementId, updates);
    setEditingRequirement(null);
    setEditState(null);
  };

  const RequirementCard: React.FC<{ requirement: RequirementFulfillment; showEditButton?: boolean }> = ({
    requirement,
    showEditButton = true,
  }) => {
    const config = statusConfig[requirement.status];
    const StatusIcon = config.icon;
    const isEditing = editingRequirement === requirement.id;

    return (
      <Card className={`${requirement.isAutoAnswered && !requirement.isManualOverride ? 'border-blue-200 bg-blue-50/30' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-sm font-medium">
                  {requirement.requirementId}
                </CardTitle>
                {onViewRequirementDetails && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => onViewRequirementDetails(requirement.requirementId)}
                  >
                    <ExternalLink size={12} />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center space-x-2 flex-wrap gap-1">
                <Badge 
                  variant={config.badgeVariant}
                  className={`${config.bgColor} ${config.color} ${config.borderColor}`}
                >
                  <StatusIcon size={12} className="mr-1" />
                  {config.label}
                </Badge>
                
                {requirement.isAutoAnswered && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <Bot size={12} className="mr-1" />
                    AI Auto-Answered
                  </Badge>
                )}
                
                {requirement.isManualOverride && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <User size={12} className="mr-1" />
                    Manual Override
                  </Badge>
                )}
                
                {requirement.confidenceLevel && (
                  <CompactConfidenceIndicator
                    confidenceLevel={requirement.confidenceLevel}
                  />
                )}
              </div>
            </div>
            
            {showEditButton && !isReadOnly && !isEditing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStartEdit(requirement)}
                className="h-7 px-2"
              >
                <Edit3 size={12} />
                Override
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isEditing && editState ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex space-x-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={editState.status === status ? "default" : "outline"}
                      onClick={() => setEditState({ ...editState, status: status as RequirementStatus })}
                      className="h-8"
                    >
                      <config.icon size={12} className="mr-1" />
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Evidence</label>
                <Textarea
                  value={editState.evidence}
                  onChange={(e) => setEditState({ ...editState, evidence: e.target.value })}
                  className="min-h-[60px]"
                  placeholder="Provide evidence supporting this status..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Justification</label>
                <Textarea
                  value={editState.justification}
                  onChange={(e) => setEditState({ ...editState, justification: e.target.value })}
                  className="min-h-[60px]"
                  placeholder="Explain the reasoning for this assessment..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Override Reason</label>
                <Textarea
                  value={editState.overrideReason}
                  onChange={(e) => setEditState({ ...editState, overrideReason: e.target.value })}
                  className="min-h-[40px]"
                  placeholder="Explain why you're overriding the AI assessment..."
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  <Save size={12} className="mr-1" />
                  Save Override
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X size={12} className="mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {requirement.isAutoAnswered && requirement.autoAnswerSource && (
                <Alert className="border-blue-200 bg-blue-50">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <div className="font-medium mb-1">Auto-answered by {requirement.autoAnswerSource}</div>
                    {requirement.confidenceLevel && (
                      <div className="mt-2">
                        <ConfidenceLevelIndicator
                          confidenceLevel={requirement.confidenceLevel}
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {requirement.isManualOverride && requirement.originalAutoAnswer && (
                <Alert className="border-orange-200 bg-orange-50">
                  <User className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    <div className="font-medium">Manual Override Applied</div>
                    <div className="text-xs mt-1">
                      Original AI assessment: {statusConfig[requirement.originalAutoAnswer].label}
                    </div>
                    {requirement.overrideReason && (
                      <div className="text-xs mt-1 italic">"{requirement.overrideReason}"</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center space-x-1 text-sm font-medium text-muted-foreground mb-1">
                    <Shield size={12} />
                    <span>Evidence</span>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                    {requirement.evidence}
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center space-x-1 text-sm font-medium text-muted-foreground mb-1">
                    <FileText size={12} />
                    <span>Justification</span>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                    {requirement.justification}
                  </p>
                </div>
              </div>
              
              {showAuditTrail && (
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User size={10} />
                        <span>{requirement.responsibleParty}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={10} />
                        <span>
                          Last assessed {formatDistanceToNow(new Date(requirement.lastAssessmentDate), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <History size={10} />
                      <span>
                        Modified by {requirement.lastModifiedBy} {formatDistanceToNow(new Date(requirement.lastModifiedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Requirement Assessment</h3>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Bot size={14} />
              <span>{autoAnsweredRequirements.length} auto-answered</span>
            </div>
            <div className="flex items-center space-x-1">
              <User size={14} />
              <span>{manualOverriddenRequirements.length} overridden</span>
            </div>
            <div className="flex items-center space-x-1">
              <Edit3 size={14} />
              <span>{manualRequirements.length} manual</span>
            </div>
          </div>
        </div>
        
        {requirements.length === 0 && (
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              No requirements found for this application. Requirements will appear here once Azure sync detects applicable compliance controls.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {requirements.length > 0 && (
        <Tabs defaultValue="auto-answered" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auto-answered" className="relative">
              AI Auto-Answered
              {autoAnsweredRequirements.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {autoAnsweredRequirements.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overridden" className="relative">
              Manual Overrides
              {manualOverriddenRequirements.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {manualOverriddenRequirements.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="manual" className="relative">
              Manual Assessment
              {manualRequirements.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {manualRequirements.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="auto-answered" className="space-y-4 mt-6">
            {autoAnsweredRequirements.length === 0 ? (
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  No requirements have been automatically answered yet. Auto-answering occurs during Azure synchronization.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {autoAnsweredRequirements.map((requirement) => (
                  <RequirementCard
                    key={requirement.id}
                    requirement={requirement}
                    showEditButton={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="overridden" className="space-y-4 mt-6">
            {manualOverriddenRequirements.length === 0 ? (
              <Alert>
                <User className="h-4 w-4" />
                <AlertDescription>
                  No manual overrides have been applied. You can override AI assessments by clicking the "Override" button on any auto-answered requirement.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {manualOverriddenRequirements.map((requirement) => (
                  <RequirementCard
                    key={requirement.id}
                    requirement={requirement}
                    showEditButton={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4 mt-6">
            {manualRequirements.length === 0 ? (
              <Alert>
                <Edit3 className="h-4 w-4" />
                <AlertDescription>
                  No manual assessments required. All applicable requirements for this application have been automatically processed.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {manualRequirements.map((requirement) => (
                  <RequirementCard
                    key={requirement.id}
                    requirement={requirement}
                    showEditButton={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default RequirementAnsweringInterface;