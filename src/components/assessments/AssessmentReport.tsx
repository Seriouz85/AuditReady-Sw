import { useRef, useState } from 'react';
import { Assessment, Requirement, Standard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ComplianceStatusBadge } from '@/components/ui/status-badge';
import { BarChart3, Download, FileText, Filter, Printer, X, FileImage } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/utils/toast';
import { generatePDF } from '@/utils/pdfUtils';
import { generateWordExport } from '@/utils/wordUtils';
import { DialogFooter } from '@/components/ui/dialog';

interface AssessmentReportProps {
  assessment: Assessment;
  requirements: Requirement[];
  standard?: Standard;
  standards?: Standard[];
  onClose: () => void;
}


// Helper function to extract attachment information from evidence content
const extractAttachmentsFromEvidence = (evidence: string) => {
  const attachments: Array<{filename: string; description: string; size?: string; type?: string}> = [];
  
  if (evidence.includes('📎') || evidence.includes('Attached Evidence Files')) {
    // Extract file information using regex patterns
    const fileMatches = evidence.match(/•\s*([^(]+)\(([^)]+)\)/g) || [];
    
    fileMatches.forEach(match => {
      const parts = match.match(/•\s*([^(]+)\(([^)]+)\)/);
      if (parts && parts[1] && parts[2]) {
        const filename = parts[1].trim();
        const details = parts[2];
        
        // Try to extract size and type from details
        const sizeMatch = details.match(/(\d+\.?\d*\s*[KMGT]?B)/i);
        const typeMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
        
        const attachment: {filename: string; description: string; size?: string; type?: string} = {
          filename,
          description: details,
        };
        
        if (sizeMatch?.[1]) {
          attachment.size = sizeMatch[1];
        }
        
        if (typeMatch?.[1]) {
          attachment.type = typeMatch[1].toUpperCase();
        } else {
          attachment.type = 'Document';
        }
        
        attachments.push(attachment);
      }
    });
  }
  
  return attachments;
};

export const AssessmentReport = ({ assessment, requirements, standard, standards, onClose }: AssessmentReportProps) => {
  const { t } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [activeStandard, setActiveStandard] = useState<string | undefined>(
    standard ? standard.id : standards && standards.length > 0 ? standards[0]?.id : undefined
  );
  
  const allStandards = standards || (standard ? [standard] : []);
  
  // Filter requirements based on active standard if selected
  const filteredRequirements = activeStandard 
    ? requirements.filter(req => req.standardId === activeStandard)
    : requirements;
    
  // Calculate stats
  const totalRequirements = filteredRequirements.length;
  const fulfilledCount = filteredRequirements.filter(req => req.status === 'fulfilled').length;
  const partialCount = filteredRequirements.filter(req => req.status === 'partially-fulfilled').length;
  const notFulfilledCount = filteredRequirements.filter(req => req.status === 'not-fulfilled').length;
  const notApplicableCount = filteredRequirements.filter(req => req.status === 'not-applicable').length;
  
  // Data for the chart
  const chartData = [
    { name: 'Fulfilled', value: fulfilledCount, color: '#22c55e' },
    { name: 'Partially Fulfilled', value: partialCount, color: '#f59e0b' },
    { name: 'Not Fulfilled', value: notFulfilledCount, color: '#ef4444' },
    { name: 'Not Applicable', value: notApplicableCount, color: '#94a3b8' },
  ].filter((item) => item.value > 0);
  

  const handleExportPDF = async () => {
    try {
      console.log('Triggering professional PDF export');
      
      // Prepare assessment data for enhanced professional PDF
      const assessmentData = {
        title: assessment.name,
        status: assessment.status,
        progress: assessment.progress,
        assessor: assessment.assessorNames && assessment.assessorNames.length > 1
          ? assessment.assessorNames.join(', ')
          : assessment.assessorName,
        startDate: assessment.startDate ? new Date(assessment.startDate).toLocaleDateString() : 'N/A',
        endDate: assessment.endDate ? new Date(assessment.endDate).toLocaleDateString() : 'N/A',
        description: assessment.description,
        
        // Enhanced Assessment Summary Structure (Key requirement)
        assessmentSummary: {
          // 1. Assessment Notes (from notes and evidence tab)
          assessmentNotes: assessment.notes || '',
          
          // 2. Evidence (same source)
          evidence: assessment.evidence || '',
          
          // 3. Attachments descriptions - Extract from evidence content
          attachments: assessment.evidence ? extractAttachmentsFromEvidence(assessment.evidence) : []
        },
        
        standards: allStandards.map(s => ({ name: s.name, version: s.version })),
        summary: {
          totalRequirements,
          fulfilled: fulfilledCount,
          partial: partialCount,
          notFulfilled: notFulfilledCount,
          notApplicable: notApplicableCount
        },
        requirements: filteredRequirements.map(req => ({
          code: req.code,
          name: req.name,
          description: req.description,
          status: String(req.status),
          ...(req.notes && { notes: req.notes }), // Individual requirement notes
          ...(req.evidence && { evidence: req.evidence }) // Individual requirement evidence
        })),
        
        // Professional metadata
        metadata: {
          organizationName: 'Organization', // Could be fetched from context
          reportType: 'Security Assessment Report',
          confidentialityLevel: 'CONFIDENTIAL',
          version: '1.0'
        }
      };
      
      // Debug logging to see what's being passed
      console.log('Assessment-level notes:', assessment.notes);
      console.log('Assessment-level evidence:', assessment.evidence);
      console.log('Number of requirements:', filteredRequirements.length);
      
      await generatePDF(
        reportRef, 
        `${assessment.name} - Assessment Report`,
        () => {
          toast.success(t('assessment.reportExported'));
        },
        assessmentData
      );
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('errors.exportFailed'));
    }
  };

  // Handle Word export
  const handleExportWord = async () => {
    try {
      console.log('Triggering professional Word export');
      
      // Prepare assessment data for enhanced professional Word document
      const assessmentData = {
        title: assessment.name,
        status: assessment.status,
        progress: assessment.progress,
        assessor: assessment.assessorNames && assessment.assessorNames.length > 1
          ? assessment.assessorNames.join(', ')
          : assessment.assessorName,
        startDate: assessment.startDate ? new Date(assessment.startDate).toLocaleDateString() : 'N/A',
        endDate: assessment.endDate ? new Date(assessment.endDate).toLocaleDateString() : 'N/A',
        description: assessment.description,
        
        // Enhanced Assessment Summary Structure (Key requirement)
        assessmentSummary: {
          // 1. Assessment Notes (from notes and evidence tab)
          assessmentNotes: assessment.notes || '',
          
          // 2. Evidence (same source)
          evidence: assessment.evidence || '',
          
          // 3. Attachments descriptions - Extract from evidence content
          attachments: assessment.evidence ? extractAttachmentsFromEvidence(assessment.evidence) : []
        },
        
        standards: allStandards.map(s => ({ name: s.name, version: s.version })),
        summary: {
          totalRequirements,
          fulfilled: fulfilledCount,
          partial: partialCount,
          notFulfilled: notFulfilledCount,
          notApplicable: notApplicableCount
        },
        requirements: filteredRequirements.map(req => ({
          code: req.code,
          name: req.name,
          description: req.description,
          status: String(req.status),
          ...(req.notes && { notes: req.notes }), // Individual requirement notes
          ...(req.evidence && { evidence: req.evidence }) // Individual requirement evidence
        })),
        
        // Professional metadata
        metadata: {
          organizationName: 'Organization', // Could be fetched from context
          reportType: 'Security Assessment Report',
          confidentialityLevel: 'CONFIDENTIAL',
          version: '1.0'
        }
      };
      
      // Debug logging to see what's being passed
      console.log('Word export - Assessment-level notes:', assessment.notes);
      console.log('Word export - Assessment-level evidence:', assessment.evidence);
      console.log('Word export - Number of requirements:', filteredRequirements.length);
      
      await generateWordExport(
        assessmentData,
        `${assessment.name} - Assessment Report`
      );
    } catch (error) {
      console.error('Word export error:', error);
      toast.error('Failed to export Word document');
    }
  };
  
  // Handle CSV export
  const handleExportCSV = () => {
    // Create header row
    const headerRow = [
      "Code", 
      "Name", 
      "Description", 
      "Status", 
      "Notes", 
      "Evidence"
    ].join(",");
    
    // Create data rows
    const dataRows = filteredRequirements.map(req => {
      // Format text fields to handle commas and newlines
      const formatCSVField = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;
      
      return [
        formatCSVField(req.code),
        formatCSVField(req.name),
        formatCSVField(req.description),
        formatCSVField(req.status),
        formatCSVField(req.notes || ''),
        '' // No evidence for individual requirements
      ].join(",");
    });
    
    // Combine header and data rows
    const csvContent = [headerRow, ...dataRows].join("\n");
    
    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a URL for the Blob
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link element and click it
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute('download', `${assessment.name}-${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Calculate compliance score
  const total = totalRequirements - notApplicableCount;
  const score = total > 0 
    ? Math.round((fulfilledCount + partialCount * 0.5) / total * 100) 
    : 0;
  
  // Group requirements by section for better organization
  const groupedRequirements = filteredRequirements.reduce((acc, req) => {
    const section = req.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(req);
    return acc;
  }, {} as Record<string, Requirement[]>);


  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col pt-[env(safe-area-inset-top)]">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-bold">{t('assessment.report.title', 'Assessment Report')}</h2>
          </div>
          <div className="flex items-center gap-2">
            {allStandards.length > 1 && (
              <div className="flex items-center gap-2 mr-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={activeStandard || 'all'} onValueChange={(value) => setActiveStandard(value === 'all' ? '' : value)}>
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Filter by standard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {allStandards.map(std => (
                        <SelectItem key={std.id} value={std.id}>
                          {std.name} {std.version}
                        </SelectItem>
                      ))}
                      <SelectItem value="all">All Standards</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCSV}
              className="gap-1 mr-2"
            >
              <Download className="h-4 w-4" />
              <span>{t('assessment.report.export_csv', 'Export CSV')}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPDF} 
              className="gap-1 mr-2"
            >
              <Printer className="h-4 w-4" />
              <span>{t('assessment.report.export_pdf', 'Export as PDF')}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportWord} 
              className="gap-1"
            >
              <FileImage className="h-4 w-4" />
              <span>{t('assessment.report.export_word', 'Export as Word')}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="gap-1">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 md:p-6 pb-[env(safe-area-inset-bottom)]">
          <div 
            ref={reportRef} 
            data-assessment-report
            className="assessment-report-content bg-gradient-to-br from-white to-gray-50/30 dark:from-slate-900 dark:to-slate-800/50 max-w-4xl mx-auto p-4 md:p-8 shadow-2xl border-0 rounded-xl print:shadow-none print:border-none print:p-6 print:bg-white print:max-w-none print:mx-0 print:rounded-none"
          >
            {/* Report Header */}
            <div className="mb-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-2xl"></div>
              <div className="relative p-8 rounded-2xl border border-primary/10">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-3">
                      {assessment.name}
                    </h1>
                    <div>
                      {activeStandard && allStandards.find(s => s.id === activeStandard) ? (
                        <p className="text-lg text-muted-foreground">
                          {allStandards.find(s => s.id === activeStandard)?.name} {allStandards.find(s => s.id === activeStandard)?.version}
                        </p>
                      ) : allStandards.length === 1 ? (
                        <p className="text-lg text-muted-foreground">{allStandards[0]?.name} {allStandards[0]?.version}</p>
                      ) : (
                        <div>
                          <p className="text-lg text-muted-foreground">{allStandards.length} Standards</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {allStandards.map(s => (
                              <Badge key={s.id} variant="outline" className="text-sm bg-white/50 backdrop-blur-sm border-primary/20 text-primary">
                                {s.name} {s.version}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <Badge variant="outline" className="px-4 py-2 text-sm font-semibold bg-white/70 backdrop-blur-sm border-2 border-primary/20">
                      {assessment.status === 'completed' 
                        ? t('assessment.status.text.completed', 'Completed') 
                        : assessment.status === 'in-progress' 
                          ? t('assessment.status.text.inProgress', 'In Progress')
                          : t('assessment.status.text.draft', 'Draft')}
                    </Badge>
                    <Badge className="px-4 py-2 text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg">
                      Score: {score}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">{t('assessment.assessor', 'Assessor')}:</p>
                  <p>
                    {assessment.assessorNames && assessment.assessorNames.length > 1
                      ? assessment.assessorNames.join(', ')
                      : assessment.assessorName}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">{t('assessment.started', 'Started')}:</p>
                  <p>{assessment.startDate ? new Date(assessment.startDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                {assessment.endDate && (
                  <div>
                    <p className="font-semibold">{t('assessment.completed', 'Completed')}:</p>
                    <p>{new Date(assessment.endDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{t('assessment.updated', 'Last updated')}:</p>
                  <p>{new Date(assessment.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              {assessment.description && (
                <div className="mt-4">
                  <p className="font-semibold">{t('assessment.description', 'Description')}:</p>
                  <p className="mt-1">{assessment.description}</p>
                </div>
              )}
            
            {/* Summary Statistics */}
            <Card className="mb-10 bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-800/50 dark:to-slate-700/30 border-0 shadow-xl print:shadow-none print:border print:border-gray-300 print:bg-white">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                  <div className="p-2 bg-gradient-to-r from-primary to-blue-600 rounded-lg print:bg-primary print:from-primary print:to-primary">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent print:text-primary print:bg-none">
                    {t('assessment.report.summary', 'Assessment Summary')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-950/40 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/30 p-6 hover:shadow-lg hover:shadow-green-200/20 dark:hover:shadow-green-900/20 transition-all duration-300 print:bg-green-50 print:border-green-300 print:shadow-none print:rounded-lg">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -mr-8 -mt-8 print:hidden"></div>
                      <div className="relative">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2 print:text-green-600 print:bg-none">
                          {fulfilledCount}
                        </div>
                        <div className="text-sm font-medium text-green-700 dark:text-green-400">{t('assessment.status.fulfilled', 'Fulfilled')}</div>
                      </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 p-6 hover:shadow-lg hover:shadow-amber-200/20 dark:hover:shadow-amber-900/20 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full -mr-8 -mt-8"></div>
                      <div className="relative">
                        <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                          {partialCount}
                        </div>
                        <div className="text-sm font-medium text-amber-700 dark:text-amber-400">{t('assessment.status.partial', 'Partially Fulfilled')}</div>
                      </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-rose-50/50 dark:from-red-950/40 dark:to-rose-950/20 border border-red-200/50 dark:border-red-800/30 p-6 hover:shadow-lg hover:shadow-red-200/20 dark:hover:shadow-red-900/20 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-full -mr-8 -mt-8"></div>
                      <div className="relative">
                        <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
                          {notFulfilledCount}
                        </div>
                        <div className="text-sm font-medium text-red-700 dark:text-red-400">{t('assessment.status.notFulfilled', 'Not Fulfilled')}</div>
                      </div>
                    </div>
                    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50/50 dark:from-slate-950/40 dark:to-gray-950/20 border border-slate-200/50 dark:border-slate-800/30 p-6 hover:shadow-lg hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all duration-300">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-500/20 to-gray-500/20 rounded-full -mr-8 -mt-8"></div>
                      <div className="relative">
                        <div className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-gray-600 bg-clip-text text-transparent mb-2">
                          {notApplicableCount}
                        </div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-400">{t('assessment.status.notApplicable', 'Not Applicable')}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart visualization */}
                  {totalRequirements > 0 && (
                    <div className="w-full md:w-1/3 h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} (${Math.round((Number(value) / totalRequirements) * 100)}%)`, name]}
                            contentStyle={{ 
                              backgroundColor: "white", 
                              borderRadius: "8px",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                              border: "none" 
                            }}
                          />
                          <Legend 
                            layout="vertical" 
                            verticalAlign="middle" 
                            align="right"
                            iconSize={10}
                            iconType="circle"
                            wrapperStyle={{ fontSize: 12 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('assessment.progress', 'Progress')}</p>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{assessment.progress}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full h-4 shadow-inner">
                      <div 
                        className={`h-4 rounded-full shadow-lg transition-all duration-500 ${assessment.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-primary to-blue-600'}`}
                        style={{ width: `${assessment.progress}%` }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full pointer-events-none"></div>
                  </div>
                </div>

                {/* Assessment Notes and Evidence - Show under Assessment Summary */}
                {(assessment.notes || assessment.evidence) && (
                  <div className="mt-6 space-y-4">
                    {assessment.notes && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Assessment Notes</h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                          {assessment.notes}
                        </div>
                      </div>
                    )}
                    
                    {assessment.evidence && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Evidence Collection</h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                          {assessment.evidence}
                        </div>
                        
                        {/* Attachment Display Section */}
                        {assessment.evidence.includes('📎') && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Attached Files</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {assessment.evidence.split('\n')
                                .filter(line => line.includes('.pdf') || line.includes('.xlsx') || line.includes('.docx'))
                                .slice(0, 6)
                                .map((line, index) => {
                                  const match = line.match(/•\s*([^(]+)\(([^)]+)\)/);
                                  if (match && match[1] && match[2]) {
                                    const filename = match[1];
                                    const details = match[2];
                                    return (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border text-xs">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-gray-800 truncate">{filename.trim()}</div>
                                          <div className="text-gray-500">{details}</div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Detailed Requirements Results */}
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-6">{t('assessment.report.details', 'Detailed Results')}</h2>
              
              {Object.entries(groupedRequirements).length > 0 ? (
                Object.entries(groupedRequirements).map(([section, reqs]) => (
                  <div key={section} className="mb-8">
                    <div className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-4 rounded-lg mb-6">
                      <h3 className="text-xl font-bold">{section}</h3>
                      <p className="text-sm text-slate-300 mt-1">{reqs.length} requirement{reqs.length !== 1 ? 's' : ''}</p>
                    </div>
                    
                    {reqs.map(req => {
                      return (
                        <div key={req.id} className="requirement-card mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 page-break-inside-avoid">
                          {/* Header Section */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{req.code}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-tight">{t(`requirement.${req.id}.name`, req.name)}</h4>
                              </div>
                            </div>
                            <ComplianceStatusBadge status={req.status as 'fulfilled' | 'partially-fulfilled' | 'not-fulfilled' | 'not-applicable'} />
                          </div>
                          
                          {/* Description Section */}
                          <div className="mb-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{t(`requirement.${req.id}.description`, req.description)}</p>
                          </div>
                          
                          {/* Notes Section */}
                          {req.notes && (
                            <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes</h5>
                              </div>
                              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-4 border-l-2 border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/30 p-3 rounded-r">
                                <div className="whitespace-pre-line">{req.notes}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-md">
                  <p className="text-muted-foreground">{t('assessment.report.no_requirements', 'No requirements available for this assessment')}</p>
                </div>
              )}
            </div>
            
            {/* Report Footer */}
            <div className="mt-10 pt-4 border-t text-sm text-center text-muted-foreground">
              <p>{t('assessment.report.generated', 'Generated on')}: {new Date().toLocaleString()}</p>
              <p className="mt-1">{t('assessment.report.footer', 'This report was generated by the AuditReady compliance management system.')}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
          <Button onClick={handleExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
        </DialogFooter>
      </div>
    </>
  );
}; 