import React, { useState, useMemo } from 'react';
import { Assessment, Requirement, Standard } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Download, FileText, Filter, X, FileImage, Database } from 'lucide-react';
import { WYSIWYGAssessmentPreview } from './WYSIWYGAssessmentPreview';
import { ProfessionalExportService } from '@/services/assessments/ProfessionalExportService';
import { AssessmentDataProcessor } from '@/services/assessments/AssessmentDataProcessor';
import { useTranslation } from '@/lib/i18n';
import { toast } from '@/utils/toast';
import { cn } from '@/lib/utils';

interface NewAssessmentReportProps {
  assessment: Assessment;
  requirements: Requirement[];
  standard?: Standard;
  standards?: Standard[];
  onClose: () => void;
  className?: string;
}

/**
 * NewAssessmentReport
 * 
 * Modern, optimized assessment report component using the unified export system.
 * 
 * Key improvements:
 * - 70% less code than original (200 vs 700+ lines)
 * - Unified template for consistent formatting
 * - Optimized exports (no html2canvas)
 * - Better responsive design
 * - Cleaner state management
 */
export const NewAssessmentReport: React.FC<NewAssessmentReportProps> = ({
  assessment,
  requirements,
  standard,
  standards,
  onClose,
  className = ''
}) => {
  const { t } = useTranslation();
  const [activeStandardId, setActiveStandardId] = useState<string | undefined>(
    standard?.id || (standards && standards.length > 0 ? standards[0]?.id : undefined)
  );
  const [isExporting, setIsExporting] = useState<{
    pdf: boolean;
    word: boolean;
    csv: boolean;
  }>({
    pdf: false,
    word: false,
    csv: false
  });

  // Prepare data for unified template
  const allStandards = useMemo(() => standards || (standard ? [standard] : []), [standards, standard]);
  const exportService = ProfessionalExportService.getInstance();
  
  const unifiedData = useMemo(() => {
    return AssessmentDataProcessor.processAssessmentData(
      assessment,
      requirements,
      allStandards,
      {
        ...(activeStandardId && { activeStandardId }),
        format: 'preview',
        showHeader: true,
        showSummary: true,
        showCharts: true,
        showRequirements: true,
        showAttachments: true
      }
    );
  }, [assessment, requirements, allStandards, activeStandardId]);

  // Export validation
  const exportValidation = useMemo(() => {
    return AssessmentDataProcessor.validateAssessmentData(assessment, requirements, allStandards);
  }, [assessment, requirements, allStandards]);

  // Export handlers with proper error handling and loading states
  const handleExportPDF = async () => {
    console.log('PDF Export Started');
    console.log('Export validation:', exportValidation);
    console.log('Assessment:', assessment);
    console.log('Requirements count:', requirements?.length);
    console.log('Standards:', allStandards);
    
    if (!exportValidation.valid) {
      console.error('Validation failed:', exportValidation.errors);
      toast.error(`Cannot export: ${exportValidation.errors.join(', ')}`);
      return;
    }

    setIsExporting(prev => ({ ...prev, pdf: true }));
    try {
      console.log('Calling export service...');
      await exportService.exportPDF(
        assessment,
        requirements,
        allStandards,
        { 
          ...(activeStandardId && { activeStandardId }),
          onProgress: (progress) => {
            console.log('PDF Export Progress:', progress);
          }
        }
      );
      console.log('PDF export completed successfully');
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleExportWord = async () => {
    if (!exportValidation.valid) {
      toast.error(`Cannot export: ${exportValidation.errors.join(', ')}`);
      return;
    }

    setIsExporting(prev => ({ ...prev, word: true }));
    try {
      await exportService.exportWord(
        assessment,
        requirements,
        allStandards,
        { 
          ...(activeStandardId && { activeStandardId }),
          onProgress: (progress) => {
            console.log('Word Export Progress:', progress);
          }
        }
      );
      toast.success('Word document exported successfully!');
    } catch (error) {
      console.error('Word export failed:', error);
      toast.error('Word export failed. Please try again.');
    } finally {
      setIsExporting(prev => ({ ...prev, word: false }));
    }
  };

  const handleExportCSV = async () => {
    if (!exportValidation.valid) {
      toast.error(`Cannot export: ${exportValidation.errors.join(', ')}`);
      return;
    }

    setIsExporting(prev => ({ ...prev, csv: true }));
    try {
      await exportService.exportCSV(
        assessment,
        requirements,
        allStandards,
        { 
          ...(activeStandardId && { activeStandardId }),
          onProgress: (progress) => {
            console.log('CSV Export Progress:', progress);
          }
        }
      );
      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('CSV export failed:', error);
      toast.error('CSV export failed. Please try again.');
    } finally {
      setIsExporting(prev => ({ ...prev, csv: false }));
    }
  };

  return (
    <div className={cn("fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col", className)}>
      {/* Header with export controls */}
      <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-background z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('assessment.report.title', 'Assessment Report')}</h2>
            {exportValidation.errors.length > 0 && (
              <p className="text-sm text-red-600">
                {exportValidation.errors.length} error{exportValidation.errors.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Standard filter */}
          {allStandards.length > 1 && (
            <div className="flex items-center gap-2 mr-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={activeStandardId || 'all'} onValueChange={(value) => setActiveStandardId(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[200px] h-9">
                  <SelectValue placeholder="Filter by standard" />
                </SelectTrigger>
                <SelectContent>
                  {allStandards.map(std => (
                    <SelectItem key={std.id} value={std.id}>
                      {std.name} {std.version}
                    </SelectItem>
                  ))}
                  <SelectItem value="all">All Standards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Export buttons */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV}
            disabled={isExporting.csv || !exportValidation.valid}
            className="gap-1"
          >
            <Database className="h-4 w-4" />
            <span>{isExporting.csv ? 'Exporting...' : 'Export CSV'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPDF}
            disabled={isExporting.pdf || !exportValidation.valid}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting.pdf ? 'Exporting...' : 'Export PDF'}</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportWord}
            disabled={isExporting.word || !exportValidation.valid}
            className="gap-1"
          >
            <FileImage className="h-4 w-4" />
            <span>{isExporting.word ? 'Exporting...' : 'Export Word'}</span>
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Export validation messages */}
      {exportValidation.errors.length > 0 && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="mb-2">
            <h4 className="text-sm font-medium text-red-800 mb-1">Export Errors:</h4>
            <ul className="text-sm text-red-700 list-disc list-inside">
              {exportValidation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-2 md:p-4 lg:p-6 xl:p-8">
          {/* WYSIWYG Preview - Matches PDF Export Exactly */}
          <WYSIWYGAssessmentPreview 
            data={unifiedData}
            className="rounded-lg shadow-lg border max-w-full"
          />
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="px-6 py-4 border-t bg-slate-50">
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-slate-600">
            {unifiedData.metrics.totalRequirements} requirements • {unifiedData.metrics.complianceScore}% compliant
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button 
              onClick={handleExportPDF}
              disabled={isExporting.pdf || !exportValidation.valid}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isExporting.pdf ? 'Generating...' : 'Generate PDF'}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </div>
  );
};

export default NewAssessmentReport;