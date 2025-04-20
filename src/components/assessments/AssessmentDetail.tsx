import { useState } from "react";
import { 
  BarChart, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  User, 
  ChevronLeft, 
  Play, 
  Pause, 
  CheckSquare, 
  AlertCircle, 
  FilePlus, 
  Save,
  Lock,
  Send,
  Trash2,
  Download,
  ClipboardCheck,
  Eye
} from "lucide-react";
import { Assessment, Requirement, RequirementStatus, Standard } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/utils/toast";
import { requirements as allRequirements, standards } from "@/data/mockData";
import { StatusBadge } from "@/components/ui/status-badge";
import { useTranslation } from "@/lib/i18n";
import { AssessmentReport } from "./AssessmentReport";
import { useAssessmentData } from "@/hooks/useAssessmentData";

type AssessmentStatus = 'draft' | 'in-progress' | 'completed';

interface AssessmentDetailProps {
  assessment: Assessment;
  onBack?: () => void;
  onSave?: (assessment: Assessment) => void;
  onDelete?: (id: string) => void;
  onComplete?: (id: string) => void;
  onReopen?: (id: string) => void;
  readOnly?: boolean;
}

export function AssessmentDetail({
  assessment,
  onBack,
  onSave,
  onDelete,
  onComplete,
  onReopen,
  readOnly = false
}: AssessmentDetailProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { t } = useTranslation();
  
  // Use the assessment data hook for state management
  const {
    assessment: localAssessment,
    requirements: assessmentRequirements,
    standards: selectedStandards,
    stats,
    updateRequirementStatus,
    updateAssessment,
  } = useAssessmentData(assessment);
  
  // Destructure stats for easier access
  const {
    totalRequirements,
    fulfilledCount,
    partialCount, 
    notFulfilledCount,
    notApplicableCount,
    progress
  } = stats;
  
  // Handle requirement status change
  const handleRequirementStatusChange = (reqId: string, newStatus: RequirementStatus) => {
    updateRequirementStatus(reqId, newStatus);
    setHasChanges(true);
  };
  
  // Save assessment changes
  const handleSave = () => {
    // Call the parent's onSave with the updated assessment
    onSave?.(localAssessment);
    setHasChanges(false);
    toast.success(t('assessments.toast.saved'));
  };
  
  // Change assessment status
  const handleStatusChange = (newStatus: AssessmentStatus) => {
    const updates: Partial<Assessment> = { status: newStatus };
    
    if (newStatus === 'in-progress' && localAssessment.status === 'draft') {
      // When starting an assessment, update the start date
      updates.startDate = new Date().toISOString();
    } 
    else if (newStatus === 'completed') {
      // When completing an assessment, update the end date
      updates.endDate = new Date().toISOString();
      updates.progress = 100;
    }
    
    updateAssessment(updates);
    setHasChanges(true);
    
    if (newStatus === 'completed') {
      onComplete?.(assessment.id);
      setShowCompleteDialog(false);
    } else if (newStatus === 'in-progress' && localAssessment.status === 'completed') {
      onReopen?.(assessment.id);
    }
    
    // Use appropriate translation keys based on status
    if (newStatus === 'completed') {
      toast.success(t('assessments.toast.completed'));
    } else if (newStatus === 'in-progress') {
      toast.success(t('assessments.toast.reopened'));
    } else {
      toast.success(t('assessments.toast.saved'));
    }
  };
  
  // Delete assessment
  const handleDelete = () => {
    onDelete?.(assessment.id);
    setShowDeleteDialog(false);
  };
  
  // Determine available actions based on assessment status
  const isCompleted = localAssessment.status === 'completed';
  const isDraft = localAssessment.status === 'draft';
  const isInProgress = localAssessment.status === 'in-progress';
  
  // Get status badge color
  const getStatusColor = () => {
    switch(localAssessment.status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch(localAssessment.status) {
      case 'completed': return <CheckSquare size={14} />;
      case 'in-progress': return <Play size={14} />;
      default: return <Clock size={14} />;
    }
  };
  
  // Show assessment report dialog
  const handleShowReport = () => {
    setShowReportDialog(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="gap-1"
        >
          <ChevronLeft size={16} />
          {t('assessment.back')}
        </Button>
        
        <div className="flex items-center gap-2">
          {hasChanges && !readOnly && (
            <Button 
              variant="default" 
              className="gap-1"
              onClick={handleSave}
            >
              <Save size={16} />
              {t('assessment.save')}
            </Button>
          )}
          
          {isCompleted && !readOnly && (
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={() => handleStatusChange('in-progress')}
            >
              <Play size={16} />
              {t('assessment.reopen')}
            </Button>
          )}
          
          {isInProgress && !readOnly && (
            <Button 
              variant="default" 
              className="gap-1 bg-green-600 hover:bg-green-700"
              onClick={() => setShowCompleteDialog(true)}
            >
              <CheckCircle2 size={16} />
              {t('assessment.complete')}
            </Button>
          )}
          
          {isDraft && !readOnly && (
            <Button 
              variant="default" 
              className="gap-1"
              onClick={() => handleStatusChange('in-progress')}
            >
              <Play size={16} />
              {t('assessment.start')}
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-2xl">{localAssessment.name}</CardTitle>
                  <CardDescription>
                    {selectedStandards.length === 1 
                      ? `${selectedStandards[0].name} ${selectedStandards[0].version}` 
                      : `${selectedStandards.length} Standards`}
                  </CardDescription>
                  {selectedStandards.length > 1 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedStandards.map(std => (
                        <Badge key={std.id} variant="outline" className="text-xs">
                          {std.name} {std.version}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div 
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor()}`}
                >
                  {localAssessment.status === 'completed' ? t('assessment.status.text.completed') : localAssessment.status === 'in-progress' ? t('assessment.status.text.inProgress') : t('assessment.status.text.draft')}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>{t('assessment.progress')}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-2.5"
                  {...(isCompleted && { className: "h-2.5 bg-green-100 [&>div]:bg-green-600" })}
                />
              </div>
              
              <Tabs 
                defaultValue="overview" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">{t('assessment.tab.overview')}</TabsTrigger>
                  <TabsTrigger value="requirements">{t('assessment.tab.requirements')}</TabsTrigger>
                  <TabsTrigger value="notes">{t('assessment.tab.notes')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">{t('assessment.description')}</h3>
                    <p className="text-sm text-muted-foreground">
                      {localAssessment.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <span>{t('assessment.started')}: {new Date(localAssessment.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-muted-foreground" />
                      <span>{t('assessment.assessor')}: {localAssessment.assessorName}</span>
                    </div>
                    {localAssessment.endDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-muted-foreground" />
                        <span>{t('assessment.completed')}: {new Date(localAssessment.endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{t('assessment.updated')}: {new Date(localAssessment.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">{t('assessment.status')}</h3>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-md">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {fulfilledCount}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('assessment.status.fulfilled')}</div>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {partialCount}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('assessment.status.partial')}</div>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-md">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {notFulfilledCount}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('assessment.status.notFulfilled')}</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-md">
                        <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                          {notApplicableCount}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('assessment.status.notApplicable')}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download size={14} />
                      {t('assessment.export')}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={handleShowReport}
                    >
                      <FilePlus size={14} />
                      {t('assessment.report')}
                    </Button>
                    
                    {!readOnly && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 size={14} />
                        {t('assessment.delete')}
                      </Button>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="requirements" className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">{t('assessment.requirements.count')} ({totalRequirements})</h3>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        <Lock size={12} className="mr-1" />
                        {t('assessment.requirements.locked')}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {assessmentRequirements.map((req) => (
                      <Card key={req.id} className="shadow-sm">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">
                                {req.code} | {req.section}
                              </div>
                              <CardTitle className="text-base">
                                {t(`requirement.${req.id}.name`, req.name)}
                              </CardTitle>
                            </div>
                            <StatusBadge status={req.status} />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 pb-3">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {t(`requirement.${req.id}.description`, req.description)}
                          </p>
                          
                          {!readOnly && !isCompleted && (
                            <div className="space-y-2">
                              <Label htmlFor={`status-${req.id}`} className="text-xs">
                                {t('assessment.status.label', 'Status')}
                              </Label>
                              <Select 
                                value={req.status} 
                                onValueChange={(value) => handleRequirementStatusChange(req.id, value as RequirementStatus)}
                                disabled={readOnly || isCompleted}
                              >
                                <SelectTrigger id={`status-${req.id}`} className="h-8">
                                  <SelectValue placeholder={t('assessment.status.placeholder', 'Select status')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="fulfilled">{t('assessment.status.fulfilled')}</SelectItem>
                                  <SelectItem value="partially-fulfilled">{t('assessment.status.partial')}</SelectItem>
                                  <SelectItem value="not-fulfilled">{t('assessment.status.notFulfilled')}</SelectItem>
                                  <SelectItem value="not-applicable">{t('assessment.status.notApplicable')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessmentNotes">{t('assessment.notes.title')}</Label>
                    <Textarea 
                      id="assessmentNotes" 
                      placeholder={t('assessment.notes.placeholder')}
                      rows={6}
                      disabled={readOnly || isCompleted}
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="evidenceCollection">{t('assessment.evidence.title')}</Label>
                    <Textarea 
                      id="evidenceCollection" 
                      placeholder={t('assessment.evidence.placeholder')}
                      rows={6}
                      disabled={readOnly || isCompleted}
                      onChange={() => setHasChanges(true)}
                    />
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="gap-1"
                      disabled={readOnly || isCompleted}
                    >
                      <FilePlus size={14} className="mr-1" />
                      {t('assessment.evidence.attach')}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Complete Assessment Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('assessment.dialog.complete.title')}</DialogTitle>
            <DialogDescription>
              {t('assessment.dialog.complete.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3">
            <Label className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-amber-500" />
              {t('assessment.dialog.warning')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {notFulfilledCount > 0 
                ? `${t('assessment.dialog.complete.warning.unfulfilled')} (${notFulfilledCount})`
                : t('assessment.dialog.complete.warning.fulfilled')}
            </p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('assessment.dialog.complete.cancel')}</Button>
            </DialogClose>
            <Button 
              variant="default" 
              onClick={() => handleStatusChange('completed')}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 size={16} />
              {t('assessment.dialog.complete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Assessment Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('assessment.dialog.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('assessment.dialog.delete.description')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3">
            <Label className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-red-500" />
              {t('assessment.dialog.warning')}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t('assessment.dialog.delete.warning')}
            </p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('assessment.dialog.delete.cancel')}</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="gap-1"
            >
              <Trash2 size={16} />
              {t('assessment.dialog.delete.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Report Dialog */}
      {showReportDialog && (
        <AssessmentReport
          assessment={localAssessment}
          requirements={assessmentRequirements}
          standards={selectedStandards}
          onClose={() => setShowReportDialog(false)}
        />
      )}
    </div>
  );
} 