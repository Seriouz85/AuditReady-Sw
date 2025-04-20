import React, { useRef, useState, useMemo } from 'react';
import { Assessment, Requirement, RequirementStatus, Standard } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { BarChart3, Download, FileText, Filter, Printer, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/utils/toast';
import { generatePDF } from '@/utils/pdfUtils';
import { useReactToPrint } from 'react-to-print';
import { DialogFooter } from '@/components/ui/dialog';

interface AssessmentReportProps {
  assessment: Assessment;
  requirements: Requirement[];
  standard?: Standard;
  standards?: Standard[];
  onClose: () => void;
}

interface RelatedRequirement {
  id: string;
  code: string;
  name: string;
  status: RequirementStatus;
}

export const AssessmentReport = ({ assessment, requirements, standard, standards, onClose }: AssessmentReportProps) => {
  const { t } = useTranslation();
  const reportRef = useRef<HTMLDivElement>(null);
  const [activeStandard, setActiveStandard] = useState<string | undefined>(
    standard ? standard.id : standards && standards.length > 0 ? standards[0].id : undefined
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
  
  // Keep the handlePrint for CSV export and other functionality
  const handlePrint = useReactToPrint({
    documentTitle: `${assessment.name} - ${new Date().toLocaleDateString()}`,
    content: () => reportRef.current,
    onBeforePrint: () => {
      document.body.classList.add('printing-assessment');
      console.log('Preparing to print assessment report');
    },
    onAfterPrint: () => {
      document.body.classList.remove('printing-assessment');
      toast.success(t('assessment.reportExported'));
      console.log('Assessment report printed successfully');
    },
    pageStyle: `
      @page {
        size: portrait;
        margin: 20mm;
      }
    `,
    removeAfterPrint: true
  });

  const handleExportPDF = () => {
    if (!reportRef.current) {
      toast.error(t('errors.reportNotFound'));
      return;
    }
    
    try {
      console.log('Triggering PDF export');
      document.body.classList.add('printing-assessment');
      generatePDF(
        reportRef, 
        `${assessment.name} - Assessment Report - ${new Date().toLocaleDateString()}`,
        () => {
          document.body.classList.remove('printing-assessment');
          toast.success(t('assessment.reportExported'));
        }
      );
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('errors.exportFailed'));
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
        formatCSVField(req.evidence || '')
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

  // Find related requirements based on tags (mocked implementation for now)
  const findRelatedRequirements = (currentReq: Requirement): RelatedRequirement[] => {
    // In a real implementation, this would use requirement tags to find related items
    // For now, we'll simulate by finding requirements with similar section codes
    const currentSectionPattern = currentReq.code.split('.')[0]; // Get the main section number
    
    return requirements
      .filter(req => 
        req.id !== currentReq.id && // Not the same requirement
        req.code.startsWith(currentSectionPattern) && // Same main section
        Math.random() > 0.7 // Randomly select some to show as related (for demo purposes)
      )
      .slice(0, 3) // Limit to 3 related requirements
      .map(req => ({
        id: req.id,
        code: req.code,
        name: req.name,
        status: req.status
      }));
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl font-bold">{t('assessment.report.title', 'Assessment Report')}</h2>
        </div>
        <div className="flex items-center gap-2">
          {allStandards.length > 1 && (
            <div className="flex items-center gap-2 mr-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={activeStandard} onValueChange={setActiveStandard}>
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
                    <SelectItem value="">All Standards</SelectItem>
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
            className="gap-1"
          >
            <Printer className="h-4 w-4" />
            <span>{t('assessment.report.export_pdf', 'Export as PDF')}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div 
          ref={reportRef} 
          className="assessment-report-content bg-white dark:bg-slate-900 max-w-4xl mx-auto p-8 shadow-sm border rounded-md print:shadow-none print:border-none print:p-0"
        >
          {/* Report Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{assessment.name}</h1>
                <div>
                  {activeStandard && allStandards.find(s => s.id === activeStandard) ? (
                    <p className="text-muted-foreground">
                      {allStandards.find(s => s.id === activeStandard)?.name} {allStandards.find(s => s.id === activeStandard)?.version}
                    </p>
                  ) : allStandards.length === 1 ? (
                    <p className="text-muted-foreground">{allStandards[0]?.name} {allStandards[0]?.version}</p>
                  ) : (
                    <div>
                      <p className="text-muted-foreground">{allStandards.length} Standards</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {allStandards.map(s => (
                          <Badge key={s.id} variant="outline" className="text-xs">
                            {s.name} {s.version}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  {assessment.status === 'completed' 
                    ? t('assessment.status.text.completed', 'Completed') 
                    : assessment.status === 'in-progress' 
                      ? t('assessment.status.text.inProgress', 'In Progress')
                      : t('assessment.status.text.draft', 'Draft')}
                </Badge>
                <Badge className="px-3 py-1 bg-blue-500 hover:bg-blue-600">
                  Score: {score}%
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">{t('assessment.assessor', 'Assessor')}:</p>
                <p>{assessment.assessorName}</p>
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
          </div>
          
          {/* Summary Statistics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('assessment.report.summary', 'Assessment Summary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-md">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {fulfilledCount}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('assessment.status.fulfilled', 'Fulfilled')}</div>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-md">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {partialCount}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('assessment.status.partial', 'Partially Fulfilled')}</div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-md">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {notFulfilledCount}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('assessment.status.notFulfilled', 'Not Fulfilled')}</div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/30 rounded-md">
                    <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                      {notApplicableCount}
                    </div>
                    <div className="text-sm text-muted-foreground">{t('assessment.status.notApplicable', 'Not Applicable')}</div>
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
              
              <div className="mt-6">
                <p className="font-semibold mb-2">{t('assessment.progress', 'Progress')}: {assessment.progress}%</p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${assessment.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'}`}
                    style={{ width: `${assessment.progress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Detailed Requirements Results */}
          <div>
            <h2 className="text-xl font-bold mb-4">{t('assessment.report.details', 'Detailed Results')}</h2>
            
            {Object.entries(groupedRequirements).length > 0 ? (
              Object.entries(groupedRequirements).map(([section, reqs]) => (
                <div key={section} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">{section}</h3>
                  
                  {reqs.map(req => {
                    const relatedReqs = findRelatedRequirements(req);
                    
                    return (
                      <div key={req.id} className="requirement-card mb-4 border rounded-md p-4 hover:shadow-md transition-shadow page-break-inside-avoid">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-muted-foreground">{req.code}</p>
                            <p className="font-medium">{t(`requirement.${req.id}.name`, req.name)}</p>
                          </div>
                          <StatusBadge status={req.status} />
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div>
                          <p className="text-sm text-muted-foreground mb-3">{t(`requirement.${req.id}.description`, req.description)}</p>
                          
                          {(req.notes || req.evidence) && (
                            <div className="mt-3 text-sm">
                              {req.notes && (
                                <div className="mb-2">
                                  <p className="font-medium">{t('requirement.field.notes', 'Notes')}:</p>
                                  <p className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded">{req.notes}</p>
                                </div>
                              )}
                              {req.evidence && (
                                <div>
                                  <p className="font-medium">{t('requirement.field.evidence', 'Evidence')}:</p>
                                  <p className="mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded">{req.evidence}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {relatedReqs.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                {t('assessment.report.related', 'Related Requirements')}:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {relatedReqs.map(related => (
                                  <div 
                                    key={related.id}
                                    className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs"
                                  >
                                    <span className="font-mono">{related.code}</span>
                                    <span className="max-w-[150px] truncate">{related.name}</span>
                                    <StatusBadge 
                                      status={related.status} 
                                      size="xs"
                                      showLabel={false}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
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
          {t('common.close')}
        </Button>
        <Button onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          {t('assessment.exportPDF')}
        </Button>
      </DialogFooter>
    </div>
  );
}; 