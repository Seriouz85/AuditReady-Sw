import { useState, useEffect, useRef } from "react";
import { 
  BarChart, 
  BarChart3,
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
  Eye,
  FileText
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
import { RequirementCard } from "./RequirementCard";
import { assessmentCompletionService, NotesTransferResult } from "@/services/assessments/AssessmentCompletionService";
import { PageHeader } from '@/components/PageHeader';
import { motion } from "framer-motion";
import { generatePDF } from "@/utils/pdfUtils";
import { generateWordExport } from "@/utils/wordUtils";

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
  const [autoSaving, setAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Handle requirement notes change
  const handleRequirementNotesChange = (reqId: string, notes: any[]) => {
    // Update the requirement notes in the assessment data
    const updatedAssessment = {
      ...localAssessment,
      requirementNotes: {
        ...localAssessment.requirementNotes,
        [reqId]: notes
      }
    };
    updateAssessment(updatedAssessment);
    setHasChanges(true);
  };
  
  // Auto-save functionality
  const autoSave = async () => {
    if (!hasChanges || readOnly) return;
    
    setAutoSaving(true);
    try {
      // Call the parent's onSave with the updated assessment
      onSave?.(localAssessment);
      setHasChanges(false);
      // Silent auto-save, no toast notification
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  // Trigger auto-save after changes
  useEffect(() => {
    if (hasChanges && !readOnly) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Set new timeout for auto-save (3 seconds after last change)
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, 3000);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasChanges, localAssessment, readOnly]);

  // Save assessment changes manually
  const handleSave = () => {
    // Clear auto-save timeout since we're saving manually
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Call the parent's onSave with the updated assessment
    onSave?.(localAssessment);
    setHasChanges(false);
    toast.success(t('assessments.toast.saved'));
  };

  // Handle navigation with unsaved changes warning
  const handleBackWithWarning = () => {
    if (hasChanges && !readOnly) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmLeave) return;
    }
    onBack?.();
  };

  // Add beforeunload event listener for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges && !readOnly) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges, readOnly]);
  
  // Change assessment status with enhanced completion handling
  const handleStatusChange = async (newStatus: AssessmentStatus) => {
    const updates: Partial<Assessment> = { status: newStatus };
    
    if (newStatus === 'in-progress' && localAssessment.status === 'draft') {
      // When starting an assessment, update the start date
      updates.startDate = new Date().toISOString();
    } 
    else if (newStatus === 'completed') {
      // Enhanced completion workflow with notes transfer
      updates.endDate = new Date().toISOString();
      updates.progress = 100;
      
      try {
        // Show loading state
        toast.info('Completing assessment and transferring notes...');
        
        // Use the assessment completion service to handle notes transfer
        const completionResult: NotesTransferResult = await assessmentCompletionService.completeAssessment(
          assessment.id,
          {
            assessment: localAssessment,
            requirements: assessmentRequirements
          }
        );
        
        if (completionResult.success) {
          toast.success(
            `Assessment completed successfully! ${completionResult.transferredCount} requirement notes transferred to global database.`
          );
          
          // Log completion details for user feedback
          console.log('Assessment completion result:', completionResult);
          
        } else {
          // Partial success - some notes transferred but with errors
          const errorMessage = completionResult.errors.length > 0 
            ? `Completed with ${completionResult.errors.length} errors. ${completionResult.transferredCount} notes transferred.`
            : 'Assessment completed with some issues.';
          
          toast.warning(errorMessage);
          console.warn('Assessment completion errors:', completionResult.errors);
        }
        
      } catch (error) {
        // Handle completion service errors
        console.error('Assessment completion failed:', error);
        toast.error('Failed to complete assessment. Please try again.');
        return; // Don't proceed with UI updates if completion failed
      }
    }
    
    // Update local state
    updateAssessment(updates);
    setHasChanges(true);
    
    if (newStatus === 'completed') {
      onComplete?.(assessment.id);
      setShowCompleteDialog(false);
      // Auto-show report preview after completion
      setTimeout(() => {
        setShowReportDialog(true);
      }, 1000); // Slightly longer delay to show completion message
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
  
  // Get status badge color with enhanced gradients
  const getStatusColor = () => {
    switch(localAssessment.status) {
      case 'completed': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20';
      case 'in-progress': return 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-200 dark:shadow-gray-900/20';
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

  // Extract attachments from evidence for export
  const extractAttachmentsFromEvidence = (evidence: string) => {
    const attachments: Array<{filename: string; description: string; size?: string; type?: string}> = [];
    
    if (evidence && (evidence.includes('📎') || evidence.includes('Attached Evidence Files'))) {
      const fileMatches = evidence.match(/•\s*([^(]+)\(([^)]+)\)/g) || [];
      
      fileMatches.forEach(match => {
        const parts = match.match(/•\s*([^(]+)\(([^)]+)\)/);
        if (parts) {
          const filename = parts[1].trim();
          const details = parts[2];
          
          const sizeMatch = details.match(/(\d+\.?\d*\s*[KMGT]?B)/i);
          const typeMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
          
          attachments.push({
            filename,
            description: details,
            size: sizeMatch ? sizeMatch[1] : undefined,
            type: typeMatch ? typeMatch[1].toUpperCase() : 'Document'
          });
        }
      });
    }
    
    return attachments;
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      const assessmentData = {
        title: localAssessment.name,
        status: localAssessment.status,
        progress: progress,
        assessor: localAssessment.assessorNames && localAssessment.assessorNames.length > 1
          ? localAssessment.assessorNames.join(', ')
          : localAssessment.assessorName,
        startDate: localAssessment.startDate ? new Date(localAssessment.startDate).toLocaleDateString() : 'N/A',
        endDate: localAssessment.endDate ? new Date(localAssessment.endDate).toLocaleDateString() : undefined,
        description: localAssessment.description,
        
        assessmentSummary: {
          assessmentNotes: localAssessment.notes,
          evidence: localAssessment.evidence,
          attachments: localAssessment.evidence ? extractAttachmentsFromEvidence(localAssessment.evidence) : []
        },
        
        standards: selectedStandards.map(s => ({ name: s.name, version: s.version })),
        summary: {
          totalRequirements,
          fulfilled: fulfilledCount,
          partial: partialCount,
          notFulfilled: notFulfilledCount,
          notApplicable: notApplicableCount
        },
        requirements: assessmentRequirements.map(req => ({
          code: req.code,
          name: req.name,
          description: req.description,
          status: req.status,
          notes: req.notes,
          evidence: req.evidence
        })),
        
        metadata: {
          organizationName: 'Organization',
          reportType: 'Security Assessment Report',
          confidentialityLevel: 'CONFIDENTIAL',
          version: '1.0'
        }
      };
      
      await generatePDF(null, `${localAssessment.name} - Assessment Report`, undefined, assessmentData);
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  // Handle Word export
  const handleExportWord = async () => {
    try {
      const assessmentData = {
        title: localAssessment.name,
        status: localAssessment.status,
        progress: progress,
        assessor: localAssessment.assessorNames && localAssessment.assessorNames.length > 1
          ? localAssessment.assessorNames.join(', ')
          : localAssessment.assessorName,
        startDate: localAssessment.startDate ? new Date(localAssessment.startDate).toLocaleDateString() : 'N/A',
        endDate: localAssessment.endDate ? new Date(localAssessment.endDate).toLocaleDateString() : undefined,
        description: localAssessment.description,
        
        assessmentSummary: {
          assessmentNotes: localAssessment.notes,
          evidence: localAssessment.evidence,
          attachments: localAssessment.evidence ? extractAttachmentsFromEvidence(localAssessment.evidence) : []
        },
        
        standards: selectedStandards.map(s => ({ name: s.name, version: s.version })),
        summary: {
          totalRequirements,
          fulfilled: fulfilledCount,
          partial: partialCount,
          notFulfilled: notFulfilledCount,
          notApplicable: notApplicableCount
        },
        requirements: assessmentRequirements.map(req => ({
          code: req.code,
          name: req.name,
          description: req.description,
          status: req.status,
          notes: req.notes,
          evidence: req.evidence
        })),
        
        metadata: {
          organizationName: 'Organization',
          reportType: 'Security Assessment Report',
          confidentialityLevel: 'CONFIDENTIAL',
          version: '1.0'
        }
      };
      
      await generateWordExport(assessmentData, `${localAssessment.name} - Assessment Report`);
    } catch (error) {
      console.error('Word export error:', error);
      toast.error('Failed to export Word document');
    }
  };
  
  // Animation variants for consistent app feel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="container mx-auto py-6 space-y-4 sm:space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex justify-between items-center"
        variants={itemVariants}
      >
        <Button 
          variant="ghost" 
          onClick={handleBackWithWarning}
          className="gap-1"
        >
          <ChevronLeft size={16} />
          {t('assessment.back')}
        </Button>
        
        <div className="flex items-center gap-2">
          {/* Auto-save status indicator */}
          {autoSaving && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              Auto-saving...
            </div>
          )}
          
          {hasChanges && !readOnly && !autoSaving && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-orange-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Unsaved changes
              </div>
              <Button 
                variant="default" 
                className="gap-1"
                onClick={handleSave}
              >
                <Save size={16} />
                {t('assessment.save')}
              </Button>
            </div>
          )}
          
          {!hasChanges && !autoSaving && !readOnly && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 size={16} />
              All changes saved
            </div>
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
      </motion.div>
      
      {/* Assessment Header with consistent PageHeader pattern */}
      <motion.div variants={itemVariants}>
        <PageHeader 
          title={localAssessment.name}
          description={selectedStandards.length === 1 
            ? `${selectedStandards[0].name} ${selectedStandards[0].version}` 
            : `Multi-standard Assessment (${selectedStandards.length} standards)`}
        />
        
        {/* Standards badges for multi-standard assessments */}
        {selectedStandards.length > 1 && (
          <motion.div 
            className="flex flex-wrap gap-2 mt-4 mb-6"
            variants={itemVariants}
          >
            {selectedStandards.map(std => (
              <Badge 
                key={std.id} 
                variant="outline" 
                className="text-xs bg-white/50 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary/10 transition-colors"
              >
                {std.name} {std.version}
              </Badge>
            ))}
          </motion.div>
        )}
        
        {/* Status and Progress Summary - Simplified */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/10"
          variants={itemVariants}
        >
          <div className="flex items-center gap-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor()}`}>
              {getStatusIcon()}
              {localAssessment.status === 'completed' ? t('assessment.status.text.completed') : localAssessment.status === 'in-progress' ? t('assessment.status.text.inProgress') : t('assessment.status.text.draft')}
            </div>
            <div className="text-sm text-muted-foreground">
              Progress: <span className="font-semibold text-foreground">{progress}%</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(localAssessment.updatedAt).toLocaleDateString()}
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
        variants={itemVariants}
      >
        {/* Main Assessment Content */}
        <div className="lg:col-span-2 xl:col-span-3">
          <Card className="bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Assessment Details</CardTitle>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last updated: {new Date(localAssessment.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="relative">
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('assessment.progress')}</span>
                  <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{progress}%</span>
                </div>
                <div className="relative">
                  <Progress 
                    value={progress} 
                    className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full shadow-inner"
                    {...(isCompleted && { className: "h-3 bg-gradient-to-r from-green-100 to-green-200 dark:from-green-800 dark:to-green-700 rounded-full shadow-inner [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-emerald-500" })}
                  />
                  {!isCompleted && (
                    <div 
                      className="absolute top-0 left-0 h-3 bg-gradient-to-r from-primary to-primary/80 rounded-full shadow-lg transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </div>
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
                  
                  {/* Standards Overview */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Standards & Scope</h3>
                    <div className="grid gap-4">
                      {selectedStandards.map(standard => (
                        <div 
                          key={standard.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-200/30 dark:border-blue-800/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                              <CheckSquare size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{standard.name}</div>
                              <div className="text-sm text-muted-foreground">{standard.version} • {standard.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{assessmentRequirements.filter(req => req.standardId === standard.id).length} requirements</div>
                            <div className="text-xs text-muted-foreground">in scope</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex flex-wrap gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 rounded-full border-red-300/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 backdrop-blur-sm"
                      onClick={handleExportPDF}
                    >
                      <Download size={14} />
                      Export PDF
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 rounded-full border-blue-300/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 backdrop-blur-sm"
                      onClick={handleExportWord}
                    >
                      <FileText size={14} />
                      Export Word
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 rounded-full border-blue-300/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 backdrop-blur-sm"
                      onClick={handleShowReport}
                    >
                      <FilePlus size={14} />
                      {t('assessment.report')}
                    </Button>
                    
                    {!readOnly && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 rounded-full border-red-300/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 backdrop-blur-sm"
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
                  
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 md:pr-4 w-full">
                    {assessmentRequirements.map((req) => (
                      <RequirementCard
                        key={req.id}
                        requirement={req}
                        readOnly={readOnly}
                        isCompleted={isCompleted}
                        onStatusChange={handleRequirementStatusChange}
                        onNotesChange={handleRequirementNotesChange}
                        fullWidth={true}
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="notes" className="space-y-4 pt-4">
                  {/* Guidance Alert */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FilePlus className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                          Report Integration
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-200">
                          Content from both fields below will appear in the <strong>Assessment Summary</strong> section of your generated reports. 
                          Use these fields to document your assessment approach, key findings, and supporting evidence.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assessmentNotes">{t('assessment.notes.title')}</Label>
                    <Textarea 
                      id="assessmentNotes" 
                      placeholder={t('assessment.notes.placeholder')}
                      value={localAssessment.notes || ''}
                      rows={6}
                      disabled={readOnly || isCompleted}
                      onChange={(e) => {
                        updateAssessment({ notes: e.target.value });
                        setHasChanges(true);
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="evidenceCollection">{t('assessment.evidence.title')}</Label>
                    <Textarea 
                      id="evidenceCollection" 
                      placeholder={t('assessment.evidence.placeholder')}
                      value={localAssessment.evidence || ''}
                      rows={6}
                      disabled={readOnly || isCompleted}
                      onChange={(e) => {
                        updateAssessment({ evidence: e.target.value });
                        setHasChanges(true);
                      }}
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
                  
                  {/* Assessment Summary Preview */}
                  {(localAssessment.notes || localAssessment.evidence) && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50/50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/30 rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Eye className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                            Assessment Summary Preview
                          </p>
                          <p className="text-sm text-green-700 dark:text-green-200 mb-3">
                            This is how your content will appear in the <strong>Assessment Summary</strong> section of exported reports:
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4 text-sm">
                        {localAssessment.notes && (
                          <div>
                            <div className="font-medium text-blue-800 dark:text-blue-300 mb-2">1. Assessment Notes</div>
                            <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded border text-muted-foreground line-clamp-3">
                              {localAssessment.notes.substring(0, 200)}...
                            </div>
                          </div>
                        )}
                        
                        {localAssessment.evidence && (
                          <div>
                            <div className="font-medium text-blue-800 dark:text-blue-300 mb-2">2. Evidence Collection</div>
                            <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded border text-muted-foreground line-clamp-3">
                              {localAssessment.evidence.substring(0, 200)}...
                            </div>
                          </div>
                        )}
                        
                        {localAssessment.evidence && localAssessment.evidence.includes('•') && (
                          <div>
                            <div className="font-medium text-blue-800 dark:text-blue-300 mb-2">3. Attached Evidence Documents</div>
                            <div className="bg-white/60 dark:bg-gray-800/60 p-3 rounded border">
                              <div className="text-xs text-muted-foreground">
                                {(() => {
                                  const attachments = localAssessment.evidence.match(/•\s*([^(]+)\(([^)]+)\)/g) || [];
                                  return attachments.length > 0 
                                    ? `${attachments.length} attachment(s) detected` 
                                    : 'No attachments detected';
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Assessment Summary Sidebar */}
        <div className="lg:col-span-1 xl:col-span-1">
          <div className="space-y-4">
            {/* Progress Overview */}
            <Card className="bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30 border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 size={18} />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">{progress}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full shadow-inner"
                  />
                </div>
                
                {/* iOS-inspired fulfillment cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-400/10 via-green-500/5 to-green-600/10 border border-green-200/30 dark:border-green-700/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-500/20 mb-2">
                        <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">{fulfilledCount}</div>
                      <div className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Fulfilled</div>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full -mr-8 -mt-8"></div>
                  </div>
                  
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400/10 via-amber-500/5 to-amber-600/10 border border-amber-200/30 dark:border-amber-700/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 mb-2">
                        <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mb-1">{partialCount}</div>
                      <div className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Partial</div>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full -mr-8 -mt-8"></div>
                  </div>
                  
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-400/10 via-red-500/5 to-red-600/10 border border-red-200/30 dark:border-red-700/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 mb-2">
                        <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                      </div>
                      <div className="text-2xl font-bold text-red-700 dark:text-red-300 mb-1">{notFulfilledCount}</div>
                      <div className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">Not Fulfilled</div>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full -mr-8 -mt-8"></div>
                  </div>
                  
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-400/10 via-slate-500/5 to-slate-600/10 border border-slate-200/30 dark:border-slate-700/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-500/20 mb-2">
                        <Eye size={16} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <div className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-1">{notApplicableCount}</div>
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">N/A</div>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-500/5 rounded-full -mr-8 -mt-8"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Assessment Details - Simplified */}
            <Card className="bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30 border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User size={18} />
                  Assessment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Assessor</span>
                    <span className="text-sm font-medium">
                      {localAssessment.assessorNames && localAssessment.assessorNames.length > 1
                        ? `${localAssessment.assessorNames[0]} +${localAssessment.assessorNames.length - 1} more`
                        : localAssessment.assessorName}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Started</span>
                    <span className="text-sm font-medium">{new Date(localAssessment.startDate).toLocaleDateString()}</span>
                  </div>
                  
                  {localAssessment.endDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Completed</span>
                      <span className="text-sm font-medium">{new Date(localAssessment.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Requirements</span>
                    <span className="text-sm font-medium">{totalRequirements} total</span>
                  </div>
                </div>
                
                {localAssessment.description && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground leading-relaxed">{localAssessment.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-900 dark:to-gray-800/30 border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2 rounded-full border-primary/20 text-primary hover:bg-primary/10"
                  onClick={handleShowReport}
                >
                  <FilePlus size={14} />
                  View Report
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2 rounded-full border-blue-300/50 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  onClick={handleExportPDF}
                >
                  <Download size={14} />
                  Export PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full gap-2 rounded-full border-green-300/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                  onClick={handleExportWord}
                >
                  <FileText size={14} />
                  Export Word
                </Button>
                
                {!readOnly && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 rounded-full border-red-300/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 size={14} />
                    Delete Assessment
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
      
      {/* Complete Assessment Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete this assessment? This action will finalize all requirement statuses and generate a completion report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3 space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <Label className="flex items-center gap-2 mb-1">
                <AlertCircle size={14} className="text-amber-500" />
                Assessment Summary
              </Label>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Total Requirements:</span>
                  <span className="font-medium">{totalRequirements}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfilled:</span>
                  <span className="font-medium text-green-600">{fulfilledCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Not Fulfilled:</span>
                  <span className="font-medium text-red-600">{notFulfilledCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion:</span>
                  <span className="font-medium">{progress}%</span>
                </div>
              </div>
            </div>
            
            {notFulfilledCount > 0 && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-400">
                  Warning: {notFulfilledCount} requirement(s) are not yet fulfilled. You can still complete the assessment and address these items later.
                </p>
              </div>
            )}
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <strong>Assessment Completion Process:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>All requirement notes will be transferred to the global requirement database</li>
                  <li>Notes will include timestamps and assessment context</li>
                  <li>Assessment will be locked and marked as completed</li>
                  <li>Comprehensive compliance report will be generated</li>
                  <li>Assessment can be reopened if needed for updates</li>
                </ul>
              </p>
            </div>
            
            {assessmentRequirements.filter(req => req.notes && req.notes.trim()).length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400">
                  <strong>Notes Transfer Summary:</strong><br/>
                  {assessmentRequirements.filter(req => req.notes && req.notes.trim()).length} requirements 
                  have notes that will be transferred to the global requirement database with timestamps.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="default" 
              onClick={() => handleStatusChange('completed')}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 size={16} />
              Complete Assessment
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
    </motion.div>
  );
} 